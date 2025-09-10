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

  async create(createCheckInRuleDto: CreateCheckInRuleDto): Promise<CheckInRule> {
    const checkInRule = this.checkInRuleRepository.create(createCheckInRuleDto);
    return await this.checkInRuleRepository.save(checkInRule);
  }

  async findAll(tenantId: string): Promise<CheckInRule[]> {
    return await this.checkInRuleRepository.find({
      where: { tenantId },
      relations: ['planningPeriod'],
    });
  }

  async findAllActiveRules(): Promise<CheckInRule[]> {
    const checkInRules = await this.checkInRuleRepository.find({
      where: { deletedAt: null },
    });
    
    return checkInRules;
  }



  async update(id: string, updateCheckInRuleDto: UpdateCheckInRuleDto, tenantId: string): Promise<CheckInRule> {
    const checkInRule = await this.checkInRuleRepository.findOne({
      where: { id, tenantId },
    });

    if (!checkInRule) {
      throw new NotFoundException(`Check-in rule with ID ${id} not found`);
    }

    Object.assign(checkInRule, updateCheckInRuleDto);
    return await this.checkInRuleRepository.save(checkInRule);
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




} 