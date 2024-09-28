import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanTask } from './entities/plan-task.entity';
import { Plan } from '../plan/entities/plan.entity';
import { Repository, TreeRepository } from 'typeorm';
import { KeyResultsService } from '../key-results/key-results.service';
import { MilestonesService } from '../milestones/milestones.service';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { UpdatePlanTasksDto } from './dto/update-plan-tasks.dto';
import { CreatePlanTaskDto } from './dto/create-plan-task.dto';

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
    private readonly milestoneService: MilestonesService,
  ) {}
  async create(
    createPlanTasksDto: CreatePlanTaskDto[],
    tenantId: string,
    level = 0,
  ): Promise<Plan[]> {
    try {
      const result: any = [];

      for (const createPlanTaskDto of createPlanTasksDto) {
        const planningUser = await this.planningUserRepository.findOne({
          where: { id: createPlanTaskDto.planningUserId },
        });

        let parentPlan: Plan | null = null;
        if (createPlanTaskDto.parentPlanId) {
          parentPlan = await this.planRepository.findOne({
            where: { id: createPlanTaskDto.parentPlanId },
          });
          if (!parentPlan) {
            throw new NotFoundException('Parent plan not found');
          }
        }

        let plan: Plan | null = null;
        if (createPlanTaskDto.planId) {
          plan = await this.planRepository.findOne({
            where: { id: createPlanTaskDto.planId },
          });
        } else {
          const newPlan = this.planRepository.create({
            tenantId,
            createdBy: createPlanTaskDto.userId,
            level,
            isReported: false,
            isValidated: false,
            planningUser,
            parentPlan,
            description: planningUser.planningPeriod.name,
            userId: createPlanTaskDto.userId,
          });
          plan = await this.planRepository.save(newPlan);
        }

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

      return await this.findOne(result[0].id); // Assuming you want to return the first created plan
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error creating tasks');
      }
      throw error;
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

  async findOne(id: string): Promise<Plan[]> {
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
        .getMany();
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

  async findByUsers(id: string, arrayOfUserId: string[]): Promise<Plan[]> {
    try {
      if (arrayOfUserId.includes('all')) {
        return await this.planRepository
          .createQueryBuilder('plan')
          .leftJoinAndSelect('plan.tasks', 'task', 'task.parentTaskId IS NULL') // Load tasks related to the plan
          .leftJoinAndSelect('task.planTask', 'descendants') // Load descendants of the tasks
          .leftJoinAndSelect('plan.planningUser', 'planningUser') // Load the planning period assignment
          .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod') // Load the planning period definition
          .leftJoinAndSelect('task.keyResult', 'keyResult') // Load the key result belonging to the parent task
          .leftJoinAndSelect('keyResult.metricType', 'metricType') // Load the metricType for the key result
          .leftJoinAndSelect('task.milestone', 'milestone') // Load the key result belonging to the parent task
          .leftJoinAndSelect('plan.comments', 'comments') // Load comments related to the plan
          .where('planningPeriod.id = :id', {
            id,
          })
          .orderBy('plan.createdAt', 'DESC') // Order by milestone for grouping
          .addOrderBy('task.id', 'DESC') // Order by keyResult for secondary grouping
          .getMany();
      }
      return await this.planRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.tasks', 'task', 'task.parentTaskId IS NULL') // Load tasks related to the plan
        .leftJoinAndSelect('task.planTask', 'descendants') // Load descendants of the tasks
        .leftJoinAndSelect('plan.planningUser', 'planningUser') // Load the planning period assignment
        .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod') // Load the planning period definition
        .leftJoinAndSelect('task.keyResult', 'keyResult') // Load the key result belonging to the parent task
        .leftJoinAndSelect('keyResult.metricType', 'metricType') // Load the metricType for the key result
        .leftJoinAndSelect('task.milestone', 'milestone') // Load the key result belonging to the parent task
        .leftJoinAndSelect('plan.comments', 'comments') // Load comments related to the plan
        .where('plan.createdBy IN (:...arrayOfUserId)', { arrayOfUserId })
        .andWhere('planningPeriod.id = :id', {
          id,
        })
        .orderBy('plan.createdAt', 'DESC') // Order by milestone for grouping
        .addOrderBy('task.createdAt', 'DESC') // Order by keyResult for secondary grouping
        .getMany();
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(
          'Error fetching the plan for the specified users',
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    updatePlanTasksDto: UpdatePlanTasksDto,
  ): Promise<Plan[]> {
    try {
      const updatedPlans: Plan[] = [];

      for (const updatePlanTaskDto of updatePlanTasksDto) {
        const task = await this.taskRepository.findOneByOrFail({
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

        // Update Milestone if provided
        if (updatePlanTaskDto.milestoneId) {
          task.milestone = await this.milestoneService.findOneMilestone(
            updatePlanTaskDto.milestoneId,
          );
        }

        const finalTask = await this.taskRepository.save(task);
        updatedPlans.push(finalTask.plan);

        // Handle subtasks
        if (
          updatePlanTaskDto.subTasks &&
          updatePlanTaskDto.subTasks.length > 0
        ) {
          for (const subTaskDto of updatePlanTaskDto.subTasks) {
            subTaskDto.parentTaskId = finalTask.id; // Set the parent task ID

            // Recursively update or create subtasks if needed
            await this.update(subTaskDto.id, [subTaskDto]); // Assuming subTaskDto has an ID
          }
        }
      }

      // Return the updated plans
      return updatedPlans.length > 0
        ? updatedPlans
        : await this.findOne(updatedPlans[0].id); // Return the updated plan or find it
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Error updating records');
      }
      throw error; // Rethrow other errors
    }
  }

  remove(id: number) {
    return `This action removes a #${id} planTask`;
  }
}
