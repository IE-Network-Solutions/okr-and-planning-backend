import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCarbonCopyLogDto } from './dto/create-carbon-copy-log.dto';
import { UpdateCarbonCopyLogDto } from './dto/update-carbon-copy-log.dto';
import { CarbonCopyLog } from './entities/carbon-copy-log.entity';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationService } from '@root/src/core/pagination/pagination.service';

@Injectable()
export class CarbonCopyLogService {
  constructor(
    @InjectRepository(CarbonCopyLog)
    private readonly carbonCopyLogRepository: Repository<CarbonCopyLog>,
    private readonly paginationService: PaginationService,
  ) {}

  create(
    createCarbonCopyLogDto: CreateCarbonCopyLogDto,
    tenantId: string,
  ): Promise<CarbonCopyLog> {
    const carbonCopyLog = this.carbonCopyLogRepository.create({
      ...createCarbonCopyLogDto,
      tenantId,
    });
    return this.carbonCopyLogRepository.save(carbonCopyLog);
  }

  findAll(
    options: IPaginationOptions,
    orderBy = 'id',
    orderDirection: 'ASC' | 'DESC' = 'DESC',
    tenantId: string,
  ): Promise<Pagination<CarbonCopyLog>> {
    return this.paginationService.paginate<CarbonCopyLog>(
      this.carbonCopyLogRepository,
      'p',
      options,
      orderBy,
      orderDirection,
      { tenantId },
    );
  }

  async findOne(id: string): Promise<CarbonCopyLog> {
    const carbonCopyLog = await this.carbonCopyLogRepository.findOne({
      where: { id },
    });
    if (!carbonCopyLog) {
      throw new NotFoundException(`Carbon Copy Log with ID ${id} not found`);
    }
    return carbonCopyLog;
  }

  async update(
    id: string,
    updateCarbonCopyLogDto: UpdateCarbonCopyLogDto,
  ): Promise<CarbonCopyLog> {
    const carbonCopyLog = await this.carbonCopyLogRepository.preload({
      id,
      ...updateCarbonCopyLogDto,
    });
    if (!carbonCopyLog) {
      throw new NotFoundException(`Carbon Copy Log with ID ${id} not found`);
    }
    return this.carbonCopyLogRepository.save(carbonCopyLog);
  }

  async remove(id: string): Promise<CarbonCopyLog> {
    const carbonCopyLog = await this.findOne(id);
    return this.carbonCopyLogRepository.softRemove(carbonCopyLog);
  }
  async removeByReprimandLogId(reprimandLogId: string): Promise<void> {
    await this.carbonCopyLogRepository.delete({ reprimandLogId });
  }
  async removeByAppreciationLogId(appreciationLogId: string): Promise<void> {
    await this.carbonCopyLogRepository.delete({ appreciationLogId });
  }
}
