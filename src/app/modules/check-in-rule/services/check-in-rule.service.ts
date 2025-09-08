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
    // Transform legacy time field to start/end format
    
    const transformedDto = this.transformLegacyTimeFormat(createCheckInRuleDto);
    
    const checkInRule = this.checkInRuleRepository.create(transformedDto);
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

  async findAllActiveRules(): Promise<CheckInRule[]> {
    const checkInRules = await this.checkInRuleRepository.find({
      where: { deletedAt: null },
    });
    
    return checkInRules;
  }



  async update(id: string, updateCheckInRuleDto: UpdateCheckInRuleDto, tenantId: string): Promise<CheckInRuleResponseDto> {
    const checkInRule = await this.checkInRuleRepository.findOne({
      where: { id, tenantId },
    });

    if (!checkInRule) {
      throw new NotFoundException(`Check-in rule with ID ${id} not found`);
    }

    // Transform legacy time field to start/end format
    const transformedDto = this.transformLegacyTimeFormat(updateCheckInRuleDto as CreateCheckInRuleDto);
    
    Object.assign(checkInRule, transformedDto);
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



  private transformLegacyTimeFormat(dto: CreateCheckInRuleDto): CreateCheckInRuleDto {
    if (!dto.targetDate) {
      return dto;
    }

    const transformedTargetDate = dto.targetDate.map(target => {
      // Priority 1: If frontend sends start/end directly, use them (already in 24-hour format from DTO transform)
      if (target.start && target.end) {
        return {
          date: target.date,
          start: this.ensure24HourFormat(target.start),
          end: this.ensure24HourFormat(target.end),
        };
      }
      
      // Priority 2: If frontend format (startTime/endTime) exists, convert to backend format (start/end)
      if (target.startTime && target.endTime) {
        return {
          date: target.date,
          start: this.ensure24HourFormat(target.startTime),
          end: this.ensure24HourFormat(target.endTime),
        };
      }
      
      // Priority 3: If legacy time field exists, convert it to start and end
      if (target.time && !target.start && !target.end) {
        return {
          date: target.date,
          start: this.ensure24HourFormat(target.time),
          end: this.ensure24HourFormat(target.time), // Use same time for both start and end
        };
      }
      
      // Priority 4: If new format already exists, keep it as is but ensure 24-hour format
      return {
        date: target.date,
        start: target.start ? this.ensure24HourFormat(target.start) : target.start,
        end: target.end ? this.ensure24HourFormat(target.end) : target.end,
      };
    });

    return {
      ...dto,
      targetDate: transformedTargetDate,
    };
  }

  private ensure24HourFormat(time: string): string {
    if (!time) return time;
    
    // If already in 24-hour format (HH:MM), return as is
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      // Pad single digit hours with zero
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }
    
    // If in 12-hour format (H:MM AM/PM), convert to 24-hour
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const period = match[3].toUpperCase();
      
      if (period === 'AM' && hours === 12) {
        hours = 0;
      } else if (period === 'PM' && hours !== 12) {
        hours += 12;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    
    // If single digit hour, pad with zero
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }
    
    return time;
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
      workScheduleId: checkInRule.workScheduleId,
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