import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { PlanTask } from './entities/plan-task.entity';
import { Plan } from '../plan/entities/plan.entity';
import { DataSource, In, Repository, TreeRepository } from 'typeorm';
import { KeyResultsService } from '../key-results/key-results.service';
import { MilestonesService } from '../milestones/milestones.service';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { CreatePlanTaskDto } from './dto/create-plan-task.dto';
import { UpdatePlanTaskDto } from './dto/update-plan-task.dto';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class PlanTasksService {
  constructor(
    @InjectRepository(PlanTask)
    private taskRepository: TreeRepository<PlanTask>,
    @InjectRepository(Plan)
    private planRepository: TreeRepository<Plan>,
    @InjectRepository(PlanningPeriodUser)
    private planningUserRepository: Repository<PlanningPeriodUser>,
    private readonly paginationService: PaginationService,
    private readonly keyResultService: KeyResultsService,
    private readonly getFromOrganizatiAndEmployeInfoService: GetFromOrganizatiAndEmployeInfoService,
    private readonly milestoneService: MilestonesService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async create(
    createPlanTasksDto: CreatePlanTaskDto[],
    tenantId: string,
    sessionId?: string,
    level = 0,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    // Establish the transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!sessionId) {
        try {
          const activeSession =
            await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
              tenantId,
            );
          sessionId = activeSession.id;
        } catch (error) {
          throw new NotFoundException(
            'There is no active Session for this tenant',
          );
        }
      }

      const result: any = [];
      if (!createPlanTasksDto || createPlanTasksDto.length === 0) {
        throw new BadRequestException('No tasks provided');
      }

      const planningUser = await this.planningUserRepository.findOne({
        where: { id: createPlanTasksDto[0].planningUserId },
      });

      let parentPlan: Plan | null = null;
      if (createPlanTasksDto[0].parentPlanId) {
        parentPlan = await this.planRepository.findOne({
          where: { id: createPlanTasksDto[0].parentPlanId },
        });
        if (!parentPlan) {
          throw new NotFoundException('Parent plan not found');
        }
      }

      let plan: Plan | null = null;
      if (createPlanTasksDto[0].planId) {
        plan = await this.planRepository.findOne({
          where: { id: createPlanTasksDto[0].planId },
        });
      } else {
        const newPlan = this.planRepository.create({
          tenantId,
          createdBy: createPlanTasksDto[0].userId,
          level,
          isReported: false,
          isValidated: false,
          planningUser,
          parentPlan,
          sessionId,
          description: planningUser.planningPeriod.name,
          userId: createPlanTasksDto[0].userId,
        });

        plan = await this.planRepository.save(newPlan);
      }

      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      for (const createPlanTaskDto of createPlanTasksDto) {
        const keyResult = createPlanTaskDto.keyResultId
          ? await this.keyResultService.findOnekeyResult(
              createPlanTaskDto.keyResultId,
            )
          : null;
        const getMilestone = createPlanTaskDto.milestoneId
          ? await this.milestoneService.findOneMilestone(
              createPlanTaskDto.milestoneId,
            )
          : null;

        let parentTask: PlanTask | null = null;
        if (createPlanTaskDto.parentTaskId) {
          parentTask = await this.taskRepository.findOne({
            where: { id: createPlanTaskDto.parentTaskId },
          });
          if (!parentTask) {
            throw new NotFoundException('Parent Task could not be found');
          }
        }

        const task = this.taskRepository.create({
          tenantId,
          createdBy: createPlanTaskDto.userId,
          task: createPlanTaskDto.task,
          targetValue: createPlanTaskDto.targetValue,
          parentTask: parentTask || null,
          priority: createPlanTaskDto.priority,
          plan,
          keyResult,
          milestone: getMilestone || null,
          achieveMK: createPlanTaskDto.achieveMK ?? false,
          level,
          weight: createPlanTaskDto.weight,
        });

        const newTask = await this.taskRepository.save(task);

        if (
          createPlanTaskDto.subTasks &&
          createPlanTaskDto.subTasks.length > 0
        ) {
          for (const subTask of createPlanTaskDto.subTasks) {
            subTask.parentTaskId = newTask.id;
            subTask.planId = plan.id;
          }
          await this.create(createPlanTaskDto.subTasks, tenantId, String(level + 1));
        }

        result.push(plan);
      }

      await queryRunner.commitTransaction();
      return await this.findOne(result[0].id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error creating tasks');
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(tenantId: string, sessionId?: string): Promise<Plan[]> {
    try {
      if (!sessionId) {
        try {
          const activeSession =
            await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
              tenantId,
            );
          sessionId = activeSession.id;
        } catch (error) {
          throw new NotFoundException(
            'There is no active Session for this tenant',
          );
        }
      }
      const planWithTasksAndDescendants = await this.planRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.tasks', 'task')
        .leftJoinAndSelect('task.planTask', 'descendants')
        .leftJoinAndSelect('plan.planningUser', 'planningUser')
        .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod')
        .where('plan.tenantId = :tenantId', { tenantId })
        .andWhere('plan.sessionId = :sessionId', { sessionId })
        .getMany();

      return planWithTasksAndDescendants;
    } catch (error) {
      if (error.name === 'NotFoundException') {
        throw new NotFoundException('Error fetching all plans');
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<Plan> {
    try {
      return await this.planRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.tasks', 'task', 'task.parentTaskId IS NULL')
        .leftJoinAndSelect('task.planTask', 'descendants')
        .leftJoinAndSelect('plan.planningUser', 'planningUser')
        .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod')
        .leftJoinAndSelect('task.keyResult', 'keyResult')
        .leftJoinAndSelect('keyResult.metricType', 'metricType')
        .leftJoinAndSelect('task.milestone', 'milestone')
        .leftJoinAndSelect('plan.comments', 'comments')
        .where('plan.id = :id', { id })
        .getOne();
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error fetching the specified tasks');
      }
      throw error;
    }
  }

  async findReportedPlanTasks(planId: string, tenantId: string, sessionId?: string): Promise<PlanTask[]> {
    if (!sessionId) {
      try {
        const activeSession =
          await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
            tenantId,
          );
        sessionId = activeSession.id;
      } catch (error) {
        throw new NotFoundException(
          'There is no active Session for this tenant',
        );
      }
    }
    const queryBuilder = this.taskRepository
      .createQueryBuilder('planTask')
      .leftJoinAndSelect('planTask.plan', 'plan')
      .leftJoinAndSelect('planTask.milestone', 'milestone')
      .leftJoinAndSelect('planTask.keyResult', 'keyResult')
      .leftJoinAndSelect('keyResult.objective', 'objective')
      .leftJoinAndSelect('keyResult.metricType', 'metricType')
      .leftJoinAndSelect('planTask.parentTask', 'parentTask')
      .leftJoinAndSelect('plan.planningUser', 'planningUser')
      .leftJoinAndSelect('plan.report', 'report')
      .where('planTask.planId = :planId', { planId })
      .andWhere('plan.sessionId = :sessionId', { sessionId });

    const unreportedTasks = await queryBuilder.getMany();
    return unreportedTasks;
  }

  async findAllUnreportedTasks(
    userId: string,
    planningPeriodId: string,
    tenantId: string,
    sessionId?: string,
  ): Promise<PlanTask[]> {
    try {
      if (!sessionId) {
        try {
          const activeSession =
            await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
              tenantId,
            );
          sessionId = activeSession.id;
        } catch (error) {
          throw new NotFoundException(
            'There is no active Session for this tenant',
          );
        }
      }

      const planningUser = await this.planningUserRepository.findOne({
        where: { planningPeriodId, userId },
      });

      if (!planningUser) {
        return [];
      }

      const plan = await this.planRepository.findOne({
        where: {
          planningUserId: planningUser.id,
          userId,
          sessionId,
          isReported: false,
          tenantId,
        },
        order: {
          createdAt: 'DESC',
        },
      });

      if (!plan) {
        return [];
      }


      // console.log('sessionId', planningUser,plan,sessionId);
      const queryBuilder = this.taskRepository
        .createQueryBuilder('planTask')
        .leftJoinAndSelect('planTask.plan', 'plan')
        .leftJoinAndSelect('planTask.milestone', 'milestone')
        .leftJoinAndSelect('planTask.keyResult', 'keyResult')
        .leftJoinAndSelect('keyResult.objective', 'objective')
        .leftJoinAndSelect('keyResult.metricType', 'metricType')
        .leftJoinAndSelect('planTask.parentTask', 'parentTask')
        .leftJoinAndSelect('plan.planningUser', 'planningUser')
        .andWhere('planTask.planId IS NOT NULL')
        .andWhere('plan.sessionId = :sessionId', { sessionId });

      if (plan.id) {
        queryBuilder.andWhere('plan.id = :planId', { planId: plan.id });
      }

      const unreportedTasks = await queryBuilder.getMany();
      return unreportedTasks;
    } catch (error) {
      throw new Error(`Failed to update PlanningPeriodUser: ${error.message}`);
    }
  }

  async findByUser(id: string, planningId: string, tenantId: string, sessionId?: string): Promise<Plan[]> {
    try {
      if (!sessionId) {
        try {
          const activeSession =
            await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
              tenantId,
            );
          sessionId = activeSession.id;
        } catch (error) {
          throw new NotFoundException(
            'There is no active Session for this tenant',
          );
        }
      }
      const planWithTasksAndDescendants = await this.planRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.tasks', 'task', 'task.parentTaskId IS NULL')
        .leftJoinAndSelect('task.planTask', 'descendants')
        .leftJoinAndSelect('plan.planningUser', 'planningUser')
        .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod')
        .leftJoinAndSelect('task.keyResult', 'keyResult')
        .leftJoinAndSelect('keyResult.metricType', 'metricType')
        .leftJoinAndSelect('task.milestone', 'milestone')
        .leftJoinAndSelect('plan.comments', 'comments')
        .where('plan.createdBy = :id', { id })
        .andWhere('planningPeriod.id = :planningId', { planningId })
        .andWhere('plan.sessionId = :sessionId', { sessionId })
        .getMany();

      return planWithTasksAndDescendants;
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(
          'Error fetching the plan for the specified user',
        );
      }
      throw error;
    }
  }

  async grouper(plans) {
    return plans.map((plan) => {
      const groupedTasks = plan.tasks.reduce((acc, task) => {
        if (task.milestone) {
          const milestoneId = task.milestone.id;
          if (!acc[milestoneId]) {
            acc[milestoneId] = {
              groupeBy: 'milestone',
              milestone: task.milestone,
              tasks: [],
            };
          }
          acc[milestoneId].tasks.push(task);
        } else if (task.keyResult) {
          const keyResultId = task.keyResult.id;
          if (!acc[keyResultId]) {
            acc[keyResultId] = {
              groupBy: 'keyResult',
              keyResult: task.keyResult,
              tasks: [],
            };
          }
          acc[keyResultId].tasks.push(task);
        }
        return acc;
      }, {});
      return {
        ...plan,
        groupedTasks: Object.values(groupedTasks),
      };
    });
  }

  async findByUserIds(
    arrayOfUserId: string[],
    paginationOptions: IPaginationOptions,
    tenantId: string, 
    sessionId?: string,
  ): Promise<Pagination<Plan>> {
    try {

      console.log('sessionId', tenantId,sessionId);
          if (!sessionId) {
            try {
              const activeSession =
                await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
                  tenantId,
                );
              sessionId = activeSession.id;
            } catch (error) {
              throw new NotFoundException(
                'There is no active Session for this tenant',
              );
            }
          }
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      const queryBuilder = this.planRepository
        .createQueryBuilder('plan') // Use a query builder
        .leftJoinAndSelect('plan.parentPlan', 'parentPlan') // Fetch parentPlan
        .leftJoinAndSelect('plan.tasks', 'tasks') // Fetch tasks
        .leftJoinAndSelect('plan.sessionId', 'tasks') // Fetch tasks
        .andWhere('plan.sessionId = :sessionId', { sessionId });


      if (!arrayOfUserId.includes('all')) {
        queryBuilder.where('plan.userId IN (:...userIds)', {
          userIds: arrayOfUserId,
        });
      }

      const paginatedData = await this.paginationService.paginate<Plan>(
        queryBuilder,
        options,
      );

      return paginatedData;
    } catch (error) {
      throw new Error(`Error fetching plans: ${error.message}`);
    }
  }

  ////////////////////////////////   ahmed changes //////////////////////////

  async findByUsers(
    id: string,
    arrayOfUserId: string[],
    paginationOptions: IPaginationOptions,
    tenantId: string,
    sessionId?: string,
  ) {

    console.log('sessionId', tenantId,sessionId);
    if (!sessionId) {
      try {
        const activeSession =
          await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
            tenantId,
          );
        sessionId = activeSession.id;
      } catch (error) {
        throw new NotFoundException(
          'There is no active Session for this tenant',
        );
      }
    }
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const queryBuilder = this.planRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.tasks', 'task')
        .leftJoinAndSelect('task.planTask', 'descendants')
        .leftJoinAndSelect('task.parentTask', 'parentTask')
        .leftJoinAndSelect('plan.planningUser', 'planningUser')
        .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod')
        .leftJoinAndSelect('task.keyResult', 'keyResult')
        .leftJoinAndSelect('keyResult.objective', 'objective')
        .leftJoinAndSelect('keyResult.metricType', 'metricType')
        .leftJoinAndSelect('task.milestone', 'milestone')
        .leftJoinAndSelect('plan.comments', 'comments')
        .andWhere('planningPeriod.id = :id', { id })
        .andWhere('plan.sessionId = :sessionId', { sessionId })
        .orderBy('plan.createdAt', 'DESC');

      if (!arrayOfUserId.includes('all')) {
        queryBuilder.andWhere('plan.createdBy IN (:...arrayOfUserId)', {
          arrayOfUserId,
        });
      }

      const paginatedData = await this.paginationService.paginate<Plan>(
        queryBuilder,
        options,
      );

      return paginatedData;
    } catch (error) {
      throw new Error(`Error fetching plans: ${error.message}`);
    }
  }

  async updateTasks(
    updatePlanTasksDto: UpdatePlanTaskDto[],
    tenantId: string,
  ): Promise<PlanTask[]> {
    try {
      let existingTasks: PlanTask[];

      const planId = updatePlanTasksDto[0]?.planId;
      if (!planId) {
        return;
      }

      const existingPlan = await this.planRepository.findOne({
        where: { id: planId },
        relations: ['tasks'],
      });

      if (existingPlan) {
        existingTasks = existingPlan.tasks;
      }

      const inputTaskIds = updatePlanTasksDto
        .map((task) => task.id)
        .filter((id) => id);

      await this.taskRepository.manager.transaction(
        async (transactionalEntityManager) => {
          if (existingTasks && existingTasks.length > 0) {
            const tasksToDelete = existingTasks.filter(
              (task) => !inputTaskIds.includes(task.id),
            );
            if (tasksToDelete.length > 0) {
              await transactionalEntityManager.softRemove(tasksToDelete);
            }
          }
        },
      );

      for (const updatePlanTaskDto of updatePlanTasksDto) {
        if (!updatePlanTaskDto.id) {
          await this.createTasks([updatePlanTaskDto], tenantId);
          continue;
        }

        const task = await this.taskRepository.findOneByOrFail({
          id: updatePlanTaskDto.id,
        });

        const parentTasks =
          task.level !== 0
            ? await this.taskRepository.findAncestorsTree(task)
            : null;
        const parentTask = parentTasks?.parentTask || null;

        Object.assign(task, {
          keyResult: await this.keyResultService.findOnekeyResult(
            updatePlanTaskDto.keyResultId,
          ),
          level: parentTask ? parentTask.level + 1 : 0,
          priority: updatePlanTaskDto.priority ?? task.priority,
          targetValue: updatePlanTaskDto.targetValue ?? task.targetValue,
          task: updatePlanTaskDto.task ?? task.task,
          weight: updatePlanTaskDto.weight,
          updatedBy: updatePlanTaskDto.userId,
          achieveMK: updatePlanTaskDto.achieveMK ?? false,
          planId: updatePlanTaskDto.planId,
        });

        if (updatePlanTaskDto.milestoneId) {
          task.milestone = await this.milestoneService.findOneMilestone(
            updatePlanTaskDto.milestoneId,
          );
        }

        const finalTask = await this.taskRepository.save(task);

        if (
          Array.isArray(updatePlanTaskDto.subTasks) &&
          updatePlanTaskDto.subTasks.length > 0
        ) {
          await this.updateSubTasks(
            updatePlanTaskDto.subTasks,
            finalTask.id,
            tenantId,
          );
        }
      }
      return await this.taskRepository.find({ where: { planId } });
    } catch (error) {
      throw new Error('Error updating records');
    }
  }

  async createTasks(createTaskDtos: UpdatePlanTaskDto[], tenantId: string) {
    const newTasks = createTaskDtos.map((dto) => ({
      ...dto,
      level: 0,
      tenantId,
    }));
    return this.taskRepository.save(newTasks);
  }

  private async updateSubTasks(
    subTasksDto: UpdatePlanTaskDto[],
    parentTaskId: string,
    tenantId: string,
  ) {
    const existingSubTasks = await this.taskRepository.find({
      where: { parentTaskId },
    });

    const inputSubTaskIds = subTasksDto
      .map((subTask) => subTask.id)
      .filter((id) => id);

    const subTasksToDelete = existingSubTasks.filter(
      (subTask) => !inputSubTaskIds.includes(subTask.id),
    );

    if (subTasksToDelete.length > 0) {
      await this.taskRepository.softRemove(subTasksToDelete);
    }

    for (const subTaskDto of subTasksDto) {
      subTaskDto.parentTaskId = parentTaskId;

      if (!subTaskDto.id) {
        await this.create([subTaskDto], tenantId);
      } else {
        await this.updateTasks([subTaskDto], tenantId);
      }
    }
  }

  async remove(id: string) {
    const planTask = await this.taskRepository.findOne({ where: { id } });

    if (!planTask?.id) {
      throw new NotFoundException(`PlanTask with ID ${id} not found`);
    }

    try {
      await this.taskRepository.softRemove(planTask);
    } catch (error) {
      return error;
    }
  }

  async findPlanTaskById(id: string): Promise<PlanTask> {
    return await this.taskRepository.findOneByOrFail({ id });
  }
}
