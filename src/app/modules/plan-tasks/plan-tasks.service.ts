import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { PlanTask } from './entities/plan-task.entity';
import { Plan } from '../plan/entities/plan.entity';
import { DataSource, Repository, TreeRepository } from 'typeorm';
import { KeyResultsService } from '../key-results/key-results.service';
import { MilestonesService } from '../milestones/milestones.service';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { CreatePlanTaskDto } from './dto/create-plan-task.dto';
import { UpdatePlanTaskDto } from './dto/update-plan-task.dto';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

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

  async findByUsers(
    id: string,
    arrayOfUserId: string[],
    options: IPaginationOptions,
  ) {
    try {
      const page = Number(options.page) || 1;
      const limit = Number(options.limit) || 10;

      const queryBuilder = this.planRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.tasks', 'task', 'task.parentTaskId IS NULL') // Load tasks related to the plan
        .leftJoinAndSelect('task.planTask', 'descendants') // Load descendants of the tasks
        .leftJoinAndSelect('plan.planningUser', 'planningUser') // Load the planning period assignment
        .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod') // Load the planning period definition
        .leftJoinAndSelect('task.keyResult', 'keyResult') // Load the key result belonging to the parent task
        .leftJoinAndSelect('keyResult.metricType', 'metricType') // Load the metricType for the key result
        .leftJoinAndSelect('task.milestone', 'milestone') // Load milestones related to tasks
        .leftJoinAndSelect('plan.comments', 'comments'); // Load comments related to the plan

      if (arrayOfUserId.includes('all')) {
        queryBuilder
          .where('planningPeriod.id = :id', { id })
          .orderBy('plan.createdAt', 'DESC') // Order by milestone for grouping
          .addOrderBy('task.id', 'DESC'); // Order by keyResult for secondary grouping
      } else {
        queryBuilder
          .where('plan.createdBy IN (:...arrayOfUserId)', { arrayOfUserId })
          .andWhere('planningPeriod.id = :id', { id })
          .orderBy('plan.createdAt', 'DESC') // Order by milestone for grouping
          .addOrderBy('task.createdAt', 'DESC'); // Order by keyResult for secondary grouping
      }

      const [result, total] = await queryBuilder
        .skip((page - 1) * limit) // Skip rows for pagination
        .take(limit) // Take the number of rows specified in the limit
        .getManyAndCount(); // Execute query and return results with total count

      return {
        items: result,
        meta: {
          totalItems: total,
          itemCount: result.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
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
        let task;

        // If the task does not exist, create a new one
        if (!updatePlanTaskDto.id) {
          task = await this.createTasks([updatePlanTaskDto], tenantId);
          continue;
        }

        // Fetch existing task or throw error
        task = await this.taskRepository.findOneByOrFail({
          id: updatePlanTaskDto.id,
        });

        // Handle parent task and level
        const parentTasks =
          task.level !== 0
            ? await this.taskRepository.findAncestorsTree(task)
            : null;
        const parentTask = parentTasks?.parentTask || null;

        // Update task details
        task.keyResult = await this.keyResultService.findOnekeyResult(
          updatePlanTaskDto.keyResultId,
        );
        task.level = parentTask ? parentTask.level + 1 : 0;
        task.priority = updatePlanTaskDto.priority ?? task.priority;
        task.targetValue = updatePlanTaskDto.targetValue ?? task.targetValue;
        task.task = updatePlanTaskDto.task ?? task.task;
        task.weight = updatePlanTaskDto.weight;
        task.updatedBy = updatePlanTaskDto.userId;
        task.achieveMK = updatePlanTaskDto.achieveMK ?? false;
        task.planId = updatePlanTaskDto.planId;

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
          updatePlanTaskDto.subTasks &&
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
      await this.taskRepository.remove(subTasksToDelete);
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
  remove(id: number) {
    return `This action removes a #${id} planTask`;
  }
}
