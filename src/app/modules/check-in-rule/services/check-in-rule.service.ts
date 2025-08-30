import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckInRule } from '../entities/check-in-rule.entity';
import { CreateCheckInRuleDto } from '../dto/create-check-in-rule.dto';
import { UpdateCheckInRuleDto } from '../dto/update-check-in-rule.dto';
import { CheckInRuleResponseDto } from '../dto/check-in-rule-response.dto';


@Injectable()
export class CheckInRuleService {
  constructor(
    @InjectRepository(CheckInRule)
    private readonly checkInRuleRepository: Repository<CheckInRule>,
  ) {}

  async create(createCheckInRuleDto: CreateCheckInRuleDto): Promise<CheckInRuleResponseDto> {
    const checkInRule = this.checkInRuleRepository.create(createCheckInRuleDto);
    const savedCheckInRule = await this.checkInRuleRepository.save(checkInRule);
    
    return this.mapToResponseDto(savedCheckInRule);
  }

  async findAll(tenantId: string): Promise<CheckInRuleResponseDto[]> {
    const checkInRules = await this.checkInRuleRepository.find({
      where: { tenantId },
      relations: ['planningPeriod'],
    });
    
    return checkInRules.map(rule => this.mapToResponseDto(rule));
  }



  async update(id: string, updateCheckInRuleDto: UpdateCheckInRuleDto, tenantId: string): Promise<CheckInRuleResponseDto> {
    const checkInRule = await this.checkInRuleRepository.findOne({
      where: { id, tenantId },
    });

    if (!checkInRule) {
      throw new NotFoundException(`Check-in rule with ID ${id} not found`);
    }

    Object.assign(checkInRule, updateCheckInRuleDto);
    const updatedCheckInRule = await this.checkInRuleRepository.save(checkInRule);
    
    return this.mapToResponseDto(updatedCheckInRule);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const checkInRule = await this.checkInRuleRepository.findOne({
      where: { id, tenantId },
    });

    if (!checkInRule) {
      throw new NotFoundException(`Check-in rule with ID ${id} not found`);
    }

    
    await this.checkInRuleRepository.softDelete(id);
  }



  private mapToResponseDto(checkInRule: CheckInRule): CheckInRuleResponseDto {
    return {
      id: checkInRule.id,
      name: checkInRule.name,
      description: checkInRule.description,
      appliesTo: checkInRule.appliesTo,
      planningPeriodId: checkInRule.planningPeriodId,
      timeBased: checkInRule.timeBased,
      achievementBased: checkInRule.achievementBased,
      frequency: checkInRule.frequency,
      operation: checkInRule.operation,
      tenantId: checkInRule.tenantId,
      categoryId: checkInRule.categoryId,
      feedbackId: checkInRule.feedbackId,
      target: checkInRule.target,
      targetDate: checkInRule.targetDate,
      createdAt: checkInRule.createdAt,
      updatedAt: checkInRule.updatedAt,
      deletedAt: checkInRule.deletedAt,
      createdBy: checkInRule.createdBy,
      updatedBy: checkInRule.updatedBy,
    };
  }
} 