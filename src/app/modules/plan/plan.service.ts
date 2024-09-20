import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';

@Injectable()
export class PlanService {
  constructor(
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

  async validate(planId: string, tenantId: string): Promise<Plan> {
    try {
      const plan = await this.planRepository.findOne({
        where: { id: planId },
      });

      if (plan.isValidated === true) {
        throw new NotFoundException('Already validated plan');
      }
      if (plan.tenantId === tenantId) {
        plan.isValidated = true;
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

  update(id: number, updatePlanDto: UpdatePlanDto) {
    return `This action updates a #${id} plan`;
  }

  remove(id: number) {
    return `This action removes a #${id} plan`;
  }
}
