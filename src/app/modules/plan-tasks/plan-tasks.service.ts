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
    level = 0,
  ): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    // Establish the transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let sessionId: string | null = null;
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
        // Attempt to find an existing plan
        plan = await this.planRepository.findOne({
          where: { id: createPlanTasksDto[0].planId },
        });
      } else {
        // Handle the case where planId is not provided
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
        throw 'Plan id does not exist';
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

        // Handle subtasks recursively
        if (
          createPlanTaskDto.subTasks &&
          createPlanTaskDto.subTasks.length > 0
        ) {
          for (const subTask of createPlanTaskDto.subTasks) {
            subTask.parentTaskId = newTask.id; // Set the parent task ID for subtasks
            subTask.planId = plan.id; // Set the plan ID for subtasks
          }
          await this.create(createPlanTaskDto.subTasks, tenantId, level + 1);
        }

        result.push(plan); // Collect the result for the return value
      }
      // Commit transaction if all operations succeed
      await queryRunner.commitTransaction();
      return await this.findOne(result[0].id); // Assuming you want to return the first created plan
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error creating tasks');
      }
      throw error;
    } finally {
      // Release the query runner after committing or rolling back
      await queryRunner.release();
    }
  }
  async findAll(tenantId: string): Promise<Plan[]> {
    try {
      const planWithTasksAndDescendants = await this.planRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.tasks', 'task') // Load tasks related to the plan
        .leftJoinAndSelect('task.planTask', 'descendants') // Load descendants of the tasks
        .leftJoinAndSelect('plan.planningUser', 'planningUser') // Load the planning period assignment
        .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod') // Load the planning period definition
        .where('plan.tenantId = :tenantId', { tenantId })
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
        .leftJoinAndSelect('plan.tasks', 'task', 'task.parentTaskId IS NULL') // Load tasks related to the plan
        .leftJoinAndSelect('task.planTask', 'descendants') // Load descendants of the tasks
        .leftJoinAndSelect('plan.planningUser', 'planningUser') // Load the planning period assignment
        .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod') // Load the planning period definition
        .leftJoinAndSelect('task.keyResult', 'keyResult') // Load the key result belonging to the parent task
        .leftJoinAndSelect('keyResult.metricType', 'metricType') //Load the metric type for the keyResult
        .leftJoinAndSelect('task.milestone', 'milestone') // Load the key result belonging to the parent task
        .leftJoinAndSelect('plan.comments', 'comments') // Load comments related to the plan
        .where('plan.id = :id', { id }) // Filter by plan ID
        .getOne();
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error fetching the specified tasks');
      }
      throw error;
    }
  }
  async findReportedPlanTasks(planId: string): Promise<PlanTask[]> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('planTask')
      .leftJoinAndSelect('planTask.plan', 'plan')
      .leftJoinAndSelect('planTask.milestone', 'milestone')
      .leftJoinAndSelect('planTask.keyResult', 'keyResult')
      .leftJoinAndSelect('keyResult.objective', 'objective') // Add join with objective
      .leftJoinAndSelect('keyResult.metricType', 'metricType') // Add join with metricType
      .leftJoinAndSelect('planTask.parentTask', 'parentTask')
      .leftJoinAndSelect('plan.planningUser', 'planningUser') // Add relation to planningUser from the Plan entity
      .leftJoinAndSelect('plan.report', 'report') // Ensure that plan.report is joined

      // Apply filtering conditions
      .where('planTask.planId = :planId', { planId }); // Filter by validated plans only

    const unreportedTasks = await queryBuilder.getMany();
    return unreportedTasks;
  }

  async findAllUnreportedTasks(
    userId: string,
    planningPeriodId: string,
    tenantId: string,
  ): Promise<PlanTask[]> {
    try {
      const planningUser = await this.planningUserRepository.findOne({
        where: { planningPeriodId, userId },
      });

      if (!planningUser) {
        throw new NotFoundException(`Planning User Not Found`);
      }

      const plan = await this.planRepository.findOne({
        where: {
          planningUserId: planningUser.id,
          userId,
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

      const queryBuilder = this.taskRepository
        .createQueryBuilder('planTask')
        .leftJoinAndSelect('planTask.plan', 'plan')
        .leftJoinAndSelect('planTask.milestone', 'milestone')
        .leftJoinAndSelect('planTask.keyResult', 'keyResult')
        .leftJoinAndSelect('keyResult.objective', 'objective') // Add join with objective
        .leftJoinAndSelect('keyResult.metricType', 'metricType') // Add join with metricType
        .leftJoinAndSelect('planTask.parentTask', 'parentTask')
        .leftJoinAndSelect('plan.planningUser', 'planningUser') // Add relation to planningUser from the Plan entity
        .andWhere('planTask.planId IS NOT NULL');

      if (plan.id) {
        queryBuilder.andWhere('plan.id = :planId', { planId: plan.id });
      }

      const unreportedTasks = await queryBuilder.getMany();

      return unreportedTasks;
    } catch (error) {
      throw new Error(`Failed to update PlanningPeriodUser: ${error.message}`);
    }
  }

  async findByUser(id: string, planningId: string): Promise<Plan[]> {
    try {
      const planWithTasksAndDescendants = await this.planRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.tasks', 'task', 'task.parentTaskId IS NULL') // Load tasks related to the plan
        .leftJoinAndSelect('task.planTask', 'descendants') // Load descendants of the tasks
        .leftJoinAndSelect('plan.planningUser', 'planningUser') // Load the planning period assignment
        .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod') // Load the planning period definition
        .leftJoinAndSelect('task.keyResult', 'keyResult') // Load the key result belonging to the parent task
        .leftJoinAndSelect('keyResult.metricType', 'metricType') //Load the metric type for the keyResult
        .leftJoinAndSelect('task.milestone', 'milestone') // Load the key result belonging to the parent task
        .leftJoinAndSelect('plan.comments', 'comments') // Load comments related to the plan
        .where('plan.createdBy = :id', { id }) // Filter by plan ID
        .andWhere('planningPeriod.id = :planningId', {
          planningId,
        })
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
  ): Promise<Pagination<Plan>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      const queryBuilder = this.planRepository
        .createQueryBuilder('plan') // Use a query builder
        .leftJoinAndSelect('plan.parentPlan', 'parentPlan') // Fetch parentPlan
        .leftJoinAndSelect('plan.tasks', 'tasks'); // Fetch tasks

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
  ) {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const queryBuilder = this.planRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.tasks', 'task') // Load all tasks related to the plan
        .leftJoinAndSelect('task.planTask', 'descendants') // Load descendants of the tasks
        .leftJoinAndSelect('task.parentTask', 'parentTask') // Explicitly load the parent task relationship
        .leftJoinAndSelect('plan.planningUser', 'planningUser') // Load the planning period assignment
        .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod') // Load the planning period definition
        .leftJoinAndSelect('task.keyResult', 'keyResult') // Load the key result belonging to the parent task
        .leftJoinAndSelect('keyResult.objective', 'objective') // Load the objective related to the key result
        .leftJoinAndSelect('keyResult.metricType', 'metricType') // Load the metricType for the key result
        .leftJoinAndSelect('task.milestone', 'milestone') // Load milestones related to tasks
        .leftJoinAndSelect('plan.comments', 'comments') // Load comments related to the plan
        .andWhere('planningPeriod.id = :id', { id })
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

  ////////////////////////////////   ahmed changes //////////////////////////

  async updateTasks(
    updatePlanTasksDto: UpdatePlanTaskDto[],
    tenantId: string,
  ): Promise<PlanTask[]> {
    try {
      // Extract the planId (assuming all tasks are associated with the same plan)
      const planId = updatePlanTasksDto[0]?.planId;

      // Fetch all existing tasks for the given planId
      const existingTasks = await this.taskRepository.find({
        where: { planId },
      });

      // Extract task IDs from the input DTO
      const inputTaskIds = updatePlanTasksDto
        .map((task) => task.id)
        .filter((id) => id);

      // Identify tasks to delete
      await this.taskRepository.manager.transaction(
        async (transactionalEntityManager) => {
          const tasksToDelete = existingTasks.filter(
            (task) => !inputTaskIds.includes(task.id),
          );

          if (tasksToDelete.length > 0) {
            await transactionalEntityManager.softRemove(tasksToDelete);
          }
        },
      );

      // Process update or create operations for each task in the input
      for (const updatePlanTaskDto of updatePlanTasksDto) {
        // let task;

        // Create a new task if ID does not exist
        if (!updatePlanTaskDto.id) {
          await this.createTasks([updatePlanTaskDto], tenantId);
          continue;
        }

        // Fetch the existing task or throw an error if not found
        const task = await this.taskRepository.findOneByOrFail({
          id: updatePlanTaskDto.id,
        });

        // Fetch parent tasks if the current task is not at the root level
        const parentTasks =
          task.level !== 0
            ? await this.taskRepository.findAncestorsTree(task)
            : null;
        const parentTask = parentTasks?.parentTask || null;

        // Prepare the updated task object
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

        // Update milestone if provided
        if (updatePlanTaskDto.milestoneId) {
          task.milestone = await this.milestoneService.findOneMilestone(
            updatePlanTaskDto.milestoneId,
          );
        }

        // Save the updated task
        const finalTask = await this.taskRepository.save(task);

        // Process subtasks if present
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
      throw 'Error updating records';
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
  // Subtasks handling
  private async updateSubTasks(
    subTasksDto: UpdatePlanTaskDto[],
    parentTaskId: string,
    tenantId: string,
  ) {
    // Fetch existing subtasks for the parent task
    const existingSubTasks = await this.taskRepository.find({
      where: { parentTaskId },
    });

    // Extract subtask IDs from the input DTO
    const inputSubTaskIds = subTasksDto
      .map((subTask) => subTask.id)
      .filter((id) => id);

    // Identify subtasks to delete
    const subTasksToDelete = existingSubTasks.filter(
      (subTask) => !inputSubTaskIds.includes(subTask.id),
    );

    // Delete subtasks not in the input
    if (subTasksToDelete.length > 0) {
      await this.taskRepository.softRemove(subTasksToDelete);
    }

    // Process update or create operations for each subtask
    for (const subTaskDto of subTasksDto) {
      subTaskDto.parentTaskId = parentTaskId;

      if (!subTaskDto.id) {
        await this.create([subTaskDto], tenantId);
      } else {
        await this.updateTasks([subTaskDto], tenantId);
      }
    }
  }

  ////////////////////////////////   ahmed changes //////////////////////////
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
