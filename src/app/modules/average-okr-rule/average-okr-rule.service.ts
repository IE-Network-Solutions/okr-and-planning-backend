import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAverageOkrRuleDto } from './dto/create-average-okr-rule.dto';
import { UpdateAverageOkrRuleDto } from './dto/update-average-okr-rule.dto';
import { AverageOkrRule } from './entities/average-okr-rule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { Repository } from 'typeorm';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class AverageOkrRuleService {
  constructor(
    @InjectRepository(AverageOkrRule)
    private averageOkrRuleRepository: Repository<AverageOkrRule>,

    private readonly paginationService: PaginationService,
  ) { }
  async createAverageOkrRule(
    createAverageOkrRuleDto: CreateAverageOkrRuleDto,
    tenantId: string,
  ): Promise<AverageOkrRule> {
    const AverageOkrRule = this.averageOkrRuleRepository.create(createAverageOkrRuleDto);

    return await this.averageOkrRuleRepository.save(AverageOkrRule);
  }

  async findAllAverageOkrRules(
    paginationOptions: PaginationDto,
    tenantId: string,
  ): Promise<Pagination<AverageOkrRule>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      const paginatedData = await this.paginationService.paginate<AverageOkrRule>(
        this.averageOkrRuleRepository,
        'AverageOkrRule',
        options,
        paginationOptions.orderBy,
        paginationOptions.orderDirection,
        { tenantId }
      );

      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneAverageOkrRule(id: string): Promise<AverageOkrRule> {
    try {
      const AverageOkrRule = await this.averageOkrRuleRepository.findOneByOrFail({
        id,
      });
      return AverageOkrRule;
    } catch (error) {
      throw new NotFoundException(`AverageOkrRule with Id ${id} not found`);
    }
  }

  async updateAverageOkrRule(
    id: string,
    updateAverageOkrRuleDto: UpdateAverageOkrRuleDto,
  ): Promise<AverageOkrRule> {
    const AverageOkrRule = await this.findOneAverageOkrRule(id);
    if (!AverageOkrRule) {
      throw new NotFoundException(`AverageOkrRule with id ${id} not found`);
    }

    await this.averageOkrRuleRepository.update(
      { id },

      updateAverageOkrRuleDto,
    );

    return await this.findOneAverageOkrRule(id);
  }

  async removeAverageOkrRule(id: string): Promise<AverageOkrRule> {
    const AverageOkrRule = await this.findOneAverageOkrRule(id);
    if (!AverageOkrRule) {
      throw new NotFoundException(`AverageOkrRule with Id ${id} not found`);
    }
    await this.averageOkrRuleRepository.softRemove({ id });
    return AverageOkrRule;
  }

  async findOneAverageOkrRuleByTenant(tenantId: string): Promise<AverageOkrRule> {
    try {
      const AverageOkrRule = await this.averageOkrRuleRepository.findOne({
        where: { tenantId: tenantId }
      });
      return AverageOkrRule;
    } catch (error) {
      throw new NotFoundException(`AverageOkrRule Not found`);
    }
  }


}
