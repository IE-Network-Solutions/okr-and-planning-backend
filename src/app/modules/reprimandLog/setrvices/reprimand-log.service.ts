import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReprimandDto } from '../dto/create-reprimand.dto';
import { UpdateReprimandDto } from '../dto/update-reprimand.dto';
import { ReprimandLog } from '../entities/reprimand.entity';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { RecognitionTypeService } from '../../recognitionType/recognition-type.service';
import { FilterReprimandLogDto } from '../dto/filter.reprimand-log.dto';
import { CarbonCopyLogService } from '../../carbonCopyLlog/carbon-copy-log.service';
import { AppreciationCountService } from './appreciation-count.service';

@Injectable()
export class ReprimandLogService {
  constructor(
    @InjectRepository(ReprimandLog)
    private readonly reprimandRepository: Repository<ReprimandLog>,
    private readonly paginationService: PaginationService,
    private readonly recognitionTypeService: RecognitionTypeService,
    private readonly carbonCopyService: CarbonCopyLogService,
    private readonly appreciationCountService: AppreciationCountService,
  ) {}

  async create(
    createReprimandDto: CreateReprimandDto,
    tenantId: string,
  ): Promise<ReprimandLog[]> {
    const { typeId, recipientIds, cc, issuerId, action } = createReprimandDto;

    // Find the recognition type by its ID
    const recognitionType = await this.recognitionTypeService.findOne(typeId);
    if (!recognitionType) {
      throw new Error(`Recognition Type ID ${typeId} not found`);
    }

    const savedLogs: ReprimandLog[] = [];

    // Create a reprimand log for each recipient
    for (const recipientId of recipientIds) {
      const reprimandLog = this.reprimandRepository.create({
        action,
        recipientId,
        issuerId,
        tenantId,
        type: recognitionType,
      });

      // Save the reprimand log
      const savedLog = await this.reprimandRepository.save(reprimandLog);
      savedLogs.push(savedLog);

      // Create carbon copy entries if there are any
      for (const copyUserId of cc || []) {
        await this.carbonCopyService.create(
          { reprimandLogId: savedLog.id, copyUserId },
          tenantId,
        );
      }
    }

    return savedLogs;
  }

  async findAll(
    options: IPaginationOptions,
    orderBy = 'id',
    orderDirection: 'ASC' | 'DESC' = 'DESC',
    tenantId: string,
    filterDto?: FilterReprimandLogDto,
  ): Promise<Pagination<ReprimandLog>> {
    try {
      const { typeId, userId } = filterDto || {};

      const queryBuilder = this.reprimandRepository
        .createQueryBuilder('reprimandLog')
        .leftJoinAndSelect('reprimandLog.type', 'reprimandType')
        .leftJoinAndSelect('reprimandLog.carbonCopies', 'carbonCopies')
        .andWhere('reprimandLog.tenantId = :tenantId', { tenantId })
        .orderBy(`reprimandLog.${orderBy}`, orderDirection);

      if (typeId) {
        queryBuilder.andWhere('reprimandLog.typeId = :typeId', { typeId });
      }

      if (userId) {
        queryBuilder.andWhere(
          '(reprimandLog.recipientId = :userId OR reprimandLog.issuerId = :userId)',
          { userId },
        );
      }

      const paginatedData = await this.paginationService.paginate<ReprimandLog>(
        queryBuilder,
        options,
      );

      return paginatedData;
    } catch (error) {
      throw error;
    }
  }

  async totalNumberofRepremand(recipientId: string): Promise<number> {
    return this.reprimandRepository
      .createQueryBuilder('reprimandLog')
      .where('reprimandLog.recipientId = :recipientId', { recipientId })
      .getCount();
  }

  async countNumberOfRepremandWithIssuedId(
    issuerId: string,
    tenantId: string,
  ): Promise<number> {
    return this.reprimandRepository.count({ where: { tenantId, issuerId } });
  }

  async countNumberOfRepremandWithRecipentId(
    recipientId: string,
    tenantId: string,
  ): Promise<number> {
    return this.reprimandRepository.count({ where: { tenantId, recipientId } });
  }

  async countAffectedEmployeesForIssuerId(
    issuerId: string,
    tenantId: string,
  ): Promise<number> {
    const result = await this.reprimandRepository
      .createQueryBuilder('reprimandLog')
      .select('COUNT(DISTINCT reprimandLog.recipientId)', 'count')
      .where('reprimandLog.tenantId = :tenantId', { tenantId })
      .andWhere('reprimandLog.issuerId =:issuerId', { issuerId })
      .getRawOne();

    return parseInt(result.count, 10);
  }

  async countAffectedEmployeesForRecipentId(
    recipientId: string,
    tenantId: string,
  ): Promise<number> {
    const result = await this.reprimandRepository
      .createQueryBuilder('reprimandLog')
      .select('COUNT(DISTINCT reprimandLog.recipientId)', 'count')
      .where('reprimandLog.tenantId = :tenantId', { tenantId })
      .andWhere('reprimandLog.recipientId =:recipientId', { recipientId })
      .getRawOne();

    return parseInt(result.count, 10);
  }

  async findOne(id: string): Promise<ReprimandLog> {
    // Use QueryBuilder to fetch reprimand by id with type joined
    const reprimand = await this.reprimandRepository
      .createQueryBuilder('reprimandLog')
      .leftJoinAndSelect('reprimandLog.type', 'reprimandType')
      .leftJoinAndSelect('reprimandLog.carbonCopies', 'carbonCopies')
      .where('reprimandLog.id = :id', { id })
      .getOne();

    // If reprimand not found, throw an exception
    if (!reprimand) {
      throw new NotFoundException(`ReprimandLog with ID ${id} not found`);
    }

    // Count the number of reprimands for the same recipientId
    const totalNumberOfRepremand = await this.totalNumberofRepremand(
      reprimand.recipientId,
    );

    const totalNumberOfAppreciation =
      await this.appreciationCountService.totalNumberofAppreciation(
        reprimand.recipientId,
      );

    reprimand['totalNumberOfAppreciation'] = totalNumberOfAppreciation;
    reprimand['totalNumberOfRepremand'] = totalNumberOfRepremand;

    return reprimand;
  }

  async update(
    id: string,
    updateReprimandDto: UpdateReprimandDto,
  ): Promise<ReprimandLog> {
    const reprimandLog = await this.findOne(id);
    if (!reprimandLog) {
      throw new NotFoundException(`ReprimandLog with ID ${id} not found`);
    }

    // Update the action if provided
    if (updateReprimandDto.action !== undefined) {
      reprimandLog.action = updateReprimandDto.action;
    }

    // Update the recipientId if provided
    if (updateReprimandDto.recipientId !== undefined) {
      reprimandLog.recipientId = updateReprimandDto.recipientId;
    }

    // Update the issuerId if provided
    if (updateReprimandDto.issuerId !== undefined) {
      reprimandLog.issuerId = updateReprimandDto.issuerId;
    }

    // Update the type if provided
    if (updateReprimandDto.typeId) {
      const recognitionType = await this.recognitionTypeService.findOne(
        updateReprimandDto.typeId,
      );
      if (!recognitionType) {
        throw new NotFoundException(
          `RecognitionType with ID ${updateReprimandDto.typeId} not found`,
        );
      }
      reprimandLog.type = recognitionType;
    }

    // Update the reprimand log
    await this.reprimandRepository.save(reprimandLog);

    // Handle updating the carbon copy entries if `cc` is provided
    if (updateReprimandDto.cc) {
      // Remove existing carbon copies for this reprimand log
      await this.carbonCopyService.removeByReprimandLogId(reprimandLog.id);

      // Add new carbon copies based on the updated `cc` array
      for (const copyUserId of updateReprimandDto.cc) {
        await this.carbonCopyService.create(
          { reprimandLogId: reprimandLog.id, copyUserId },
          reprimandLog.tenantId,
        );
      }
    }

    // Return the updated reprimand log
    return await this.findOne(id);
  }

  async remove(id: string): Promise<ReprimandLog> {
    const reprimand = await this.findOne(id);
    if (!reprimand) {
      throw new NotFoundException(`ReprimandLog with ID ${id} not found`);
    }
    return this.reprimandRepository.softRemove(reprimand);
  }
}
