import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { Plan } from './entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(PlanTask)
    private taskRepository: TreeRepository<PlanTask>,
    @InjectRepository(Plan)
    private planRepository: TreeRepository<Plan>,
    @InjectRepository(PlanningPeriodUser)
    private planningUserRepository: Repository<PlanningPeriodUser>,
    private readonly paginationService: PaginationService,
  ) {}
  async create(createPlanDto: CreatePlanDto, tenantId: string): Promise<Plan> {
    try {
      const planningUser = await this.planningUserRepository.findOne({
        where: { id: createPlanDto.planningUserId },
      });

      if (!planningUser) {
        throw new NotFoundException('Planning user assignment not found');
      }

      let parentPlan: Plan | null = null;

      if (createPlanDto.parentPlanId) {
        parentPlan = await this.planRepository.findOne({
          where: { id: createPlanDto.parentPlanId },
        });
        if (!parentPlan) {
          throw new NotFoundException('Parent plan not found');
        }
      }

      if (!createPlanDto.parentPlanId) {
        const plan = this.planRepository.create({
          ...createPlanDto,
          tenantId: tenantId,
        });
        plan.isReported = false;
        plan.isValidated = false;
        return await this.planRepository.save(plan);
      }

      const plan = this.planRepository.create({
        userId: createPlanDto.userId,
        tenantId: tenantId,
        description: planningUser.planningPeriod.name,
        level: createPlanDto.level,
        parentPlan: parentPlan || null,
        planningUser: planningUser,
        isReported: false,
        isValidated: false,
        createdBy: createPlanDto.userId,
      });
      return await this.planRepository.save(plan);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error creating the plan');
      }
      throw error;
    }
  }

  async validate(
    planId: string,
    tenantId: string,
    value: string,
  ): Promise<Plan> {
    try {
      const plan = await this.planRepository.findOne({
        where: { id: planId },
      });
      let bool: boolean;
      if (value === 'true') {
        bool = true;
      } else {
        bool = false;
      }
      if (plan.isValidated === true && bool === true) {
        throw new NotFoundException('Already validated plan');
      } else if (plan.isValidated === false && bool === false) {
        throw new NotFoundException('Already open plan');
      }
      if (plan.tenantId === tenantId) {
        plan.isValidated = bool;
      }
      return await this.planRepository.save(plan);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error validation the plan');
      }
      throw error;
    }
  }

  async open(planId: string, tenantId: string): Promise<Plan> {
    try {
      const plan = await this.planRepository.findOne({
        where: { id: planId },
      });

      if (plan.isValidated === false) {
        throw new NotFoundException('Already opened plan');
      }

      if (plan.tenantId === tenantId) {
        plan.isValidated = false;
      }
      return await this.planRepository.save(plan);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error validation the plan');
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all plan`;
  }

  async findOne(id: string): Promise<Plan> {
    try {
      const plan = await this.planRepository.findOneByOrFail({ id });
      return await this.planRepository.findDescendantsTree(plan);
      // return plan
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Error fetching the specified plan');
      }
      throw error;
    }
  }
  async remove(id: string) {
    try {
      const plan = await this.planRepository.findOneByOrFail({ id });
      if (!plan) {
        throw new NotFoundException('Error while deleting the plan');
      }
      const tasks = await this.taskRepository.find({
        where: { plan: { id: plan.id } },
      });
      for (const task of tasks) {
        const id = task.id;
        await this.taskRepository.softRemove({ id });
      }
      return await this.planRepository.softRemove({ id });
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(
          `The specified plan with id ${id} can not be found`,
        );
      }
      throw error;
    }
  }
}
