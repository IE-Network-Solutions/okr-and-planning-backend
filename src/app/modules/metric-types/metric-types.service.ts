import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMetricTypeDto } from './dto/create-metric-type.dto';
import { UpdateMetricTypeDto } from './dto/update-metric-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MetricType } from './entities/metric-type.entity';
import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class MetricTypesService {
  constructor(
    @InjectRepository(MetricType)
    private metricTypeRepository: Repository<MetricType>,

    private readonly paginationService: PaginationService,
  ) {}
  async createMetricType(
    createMetricTypeDto: CreateMetricTypeDto,
    tenantId: string,
  ): Promise<MetricType> {
    const MetricType = this.metricTypeRepository.create(createMetricTypeDto);

    return await this.metricTypeRepository.save(MetricType);
  }

  async findAllMetricTypes(
    paginationOptions: PaginationDto,
    tenantId: string,
  ): Promise<Pagination<MetricType>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      const paginatedData = await this.paginationService.paginate<MetricType>(
        this.metricTypeRepository,
        'MetricType',
        options,
        paginationOptions.orderBy,
        paginationOptions.orderDirection,
      );

      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneMetricType(id: string): Promise<MetricType> {
    try {
      const MetricType = await this.metricTypeRepository.findOneByOrFail({
        id,
      });
      return MetricType;
    } catch (error) {
      throw new NotFoundException(`MetricType with Id ${id} not found`);
    }
  }

  async updateMetricType(
    id: string,
    updateMetricTypeDto: UpdateMetricTypeDto,
  ): Promise<MetricType> {
    const MetricType = await this.findOneMetricType(id);
    if (!MetricType) {
      throw new NotFoundException(`MetricType with id ${id} not found`);
    }

    await this.metricTypeRepository.update(
      { id },

      updateMetricTypeDto,
    );

    return await this.findOneMetricType(id);
  }

  async removeMetricType(id: string): Promise<MetricType> {
    const MetricType = await this.findOneMetricType(id);
    if (!MetricType) {
      throw new NotFoundException(`MetricType with Id ${id} not found`);
    }
    await this.metricTypeRepository.softRemove({ id });
    return MetricType;
  }
}
