import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanTaskDto } from './dto/create-plan-task.dto';
import { UpdatePlanTaskDto } from './dto/update-plan-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanTask } from './entities/plan-task.entity';
import { Plan } from '../plan/entities/plan.entity';
import { Repository, TreeRepository } from 'typeorm';
import { KeyResultsService } from '../key-results/key-results.service';
import { MilestonesService } from '../milestones/milestones.service';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';

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
    createPlanTaskDto: CreatePlanTaskDto,
    tenantId: string,
    parentTask?: PlanTask,
    level = 0,
  ): Promise<PlanTask> {
    try {
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
        const planning = await this.planRepository.create({
          tenantId: tenantId,
          createdBy: createPlanTaskDto.userId,
          level: level,
          isReported: false,
          isValidated: false,
          planningUser: planningUser,
          parentPlan: parentPlan || null,
          description: planningUser.planningPeriod.name,
        });
        plan = await this.planRepository.save(planning);
      }
      const keyResult = await this.keyResultService.findOnekeyResult(
        createPlanTaskDto.keyResultId,
      );
      let getMilestone = null;
      if (createPlanTaskDto.milestoneId) {
        getMilestone = await this.milestoneService.findOneMilestone(
          createPlanTaskDto.milestoneId,
        );
      }
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
        tenantId: tenantId,
        createdBy: createPlanTaskDto.userId,
        task: createPlanTaskDto.task,
        targetValue: createPlanTaskDto.targetValue,
        parentTask: parentTask || null,
        priority: createPlanTaskDto.priority,
        plan: plan,
        keyResult: keyResult,
        milestone: getMilestone || null,
        level: level,
      });
      return await this.taskRepository.save(task);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error creating tasks');
      }
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
      const planWithTasksAndDescendants = await this.planRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.tasks', 'task') // Load tasks related to the plan
        .leftJoinAndSelect('task.planTask', 'descendants') // Load descendants of the tasks
        .leftJoinAndSelect('plan.planningUser', 'planningUser') // Load the planning period assignment
        .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod') // Load the planning period definition
        .where('plan.id = :id', { id }) // Filter by plan ID
        .getMany();

      return planWithTasksAndDescendants;
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error fetching the specified tasks');
      }
      throw error;
    }
  }

  async findByUser(id: string): Promise<Plan[]> {
    try {
      const planWithTasksAndDescendants = await this.planRepository
        .createQueryBuilder('plan')
        .leftJoinAndSelect('plan.tasks', 'task') // Load tasks related to the plan
        .leftJoinAndSelect('task.planTask', 'descendants') // Load descendants of the tasks
        .leftJoinAndSelect('plan.planningUser', 'planningUser') // Load the planning period assignment
        .leftJoinAndSelect('planningUser.planningPeriod', 'planningPeriod') // Load the planning period definition
        .where('plan.createdBy = :id', { id }) // Filter by plan ID
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
  update(id: number, updatePlanTaskDto: UpdatePlanTaskDto) {
    return `This action updates a #${id} planTask`;
  }

  remove(id: number) {
    return `This action removes a #${id} planTask`;
  }
}
