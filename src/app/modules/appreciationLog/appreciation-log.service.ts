import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppreciationLog } from './entities/appreciation-log.entity';
import { CreateAppreciationDto } from './dto/create-appreciation.dto';
import { UpdateAppreciationDto } from './dto/update-appreciation.dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { RecognitionTypeService } from '../recognitionType/recognition-type.service';
import { CarbonCopyLogService } from '../carbonCopyLlog/carbon-copy-log.service';
import { FilterAppreciationLogDto } from './dto/filter.appreciation-log.dto';
import { ReprimandLogService } from '../reprimandLog/setrvices/reprimand-log.service';
import { ReprimandLog } from '../reprimandLog/entities/reprimand.entity';

@Injectable()
export class AppreciationService {
  constructor(
    @InjectRepository(AppreciationLog)
    private appreciationLogRepository: Repository<AppreciationLog>,
    private readonly paginationService: PaginationService,
    private readonly recognitionTypeService: RecognitionTypeService,
    private readonly carbonCopyService: CarbonCopyLogService,
    private readonly repremandService: ReprimandLogService,
  ) {}

  async create(
    createAppreciationDto: CreateAppreciationDto,
    tenantId: string,
  ): Promise<AppreciationLog[]> {
    const { typeId, recipientIds, cc, issuerId, action } =
      createAppreciationDto;

    // Find the recognition type by its ID
    const recognitionType = await this.recognitionTypeService.findOne(typeId);
    if (!recognitionType) {
      throw new Error(`Recognition Type ID ${typeId} not found`);
    }

    const savedLogs: AppreciationLog[] = [];

    // Create an appreciation log for each recipient
    for (const recipientId of recipientIds) {
      const appreciationLog = this.appreciationLogRepository.create({
        action,
        recipientId,
        issuerId,
        tenantId,
        type: recognitionType,
      });

      // Save the appreciation log
      const savedLog = await this.appreciationLogRepository.save(
        appreciationLog,
      );
      savedLogs.push(savedLog);

      for (const copyUserId of cc) {
        await this.carbonCopyService.create(
          { appreciationLogId: savedLog.id, copyUserId },
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
    filterDto?: FilterAppreciationLogDto,
  ): Promise<Pagination<AppreciationLog>> {
    try {
      const { typeId, userId } = filterDto || {};

      const queryBuilder = this.appreciationLogRepository
        .createQueryBuilder('appreciationLog')
        .leftJoinAndSelect('appreciationLog.type', 'recognitionType')
        .leftJoinAndSelect('appreciationLog.carbonCopies', 'carbonCopies')
        .andWhere('appreciationLog.tenantId = :tenantId', { tenantId })
        .orderBy(`appreciationLog.${orderBy}`, orderDirection);

      if (typeId) {
        queryBuilder.andWhere('appreciationLog.typeId = :typeId', { typeId });
      }

      if (userId) {
        queryBuilder.andWhere(
          '(appreciationLog.recipientId = :userId OR appreciationLog.issuerId = :userId)',
          { userId },
        );
      }

      const paginatedData =
        await this.paginationService.paginate<AppreciationLog>(
          queryBuilder,
          options,
        );

      return paginatedData;
    } catch (error) {
      throw error;
    }
  }

  async findAllAppreciationAndRepremandLogs(
    options: IPaginationOptions,
    orderBy = 'id',
    orderDirection: 'ASC' | 'DESC' = 'DESC',
    tenantId: string,
    filterDto?: FilterAppreciationLogDto,
  ): Promise<(AppreciationLog | ReprimandLog)[]> {
    try {
      const appreciationLogs = (
        await this.findAll(
          options,
          orderBy,
          orderDirection,
          tenantId,
          filterDto,
        )
      ).items;

      const repremandLogs = (
        await this.repremandService.findAll(
          options,
          orderBy,
          orderDirection,
          tenantId,
          filterDto,
        )
      ).items;

      return [...appreciationLogs, ...repremandLogs];
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string): Promise<AppreciationLog> {
    // Use QueryBuilder to fetch appreciation by id with recognition type joined
    const appreciation = await this.appreciationLogRepository
      .createQueryBuilder('appreciation')
      .leftJoinAndSelect('appreciation.type', 'recognitionType')
      .leftJoinAndSelect('appreciation.carbonCopies', 'carbonCopies')
      .where('appreciation.id = :id', { id })
      .getOne();

    // If appreciation not found, throw an exception
    if (!appreciation) {
      throw new NotFoundException(`Appreciation with ID ${id} not found`);
    }

    // Count the number of appreciation logs for the same recipientId
    const totalNumberOfAppreciation = await this.totalNumberofAppreciation(
      appreciation.recipientId,
    );

    const totalNumberOfRepremand =
      await this.repremandService.totalNumberofRepremand(
        appreciation.recipientId,
      );

    appreciation['totalNumberOfAppreciation'] = totalNumberOfAppreciation;
    appreciation['totalNumberOfRepremand'] = totalNumberOfRepremand;

    return appreciation;
  }

  async totalNumberofAppreciation(recipientId: string): Promise<number> {
    return this.appreciationLogRepository
      .createQueryBuilder('appreciation')
      .where('appreciation.recipientId = :recipientId', { recipientId })
      .getCount();
  }

  async countNumberOfAppreciationWithIssuedId(
    userId: string,
    tenantId: string,
  ): Promise<any> {
    return await this.appreciationLogRepository.count({
      where: { tenantId, issuerId: userId },
    });
  }

  async countNumberOfAppreciationGivenWithRecipentId(
    userId: string,
    tenantId: string,
  ): Promise<number> {
    return await this.appreciationLogRepository.count({
      where: { tenantId, recipientId: userId },
    });
  }

  async countAffectedEmployeesForIssuerId(
    issuerId: string,
    tenantId: string,
  ): Promise<number> {
    const result = await this.appreciationLogRepository
      .createQueryBuilder('appreciationLog')
      .select('COUNT(DISTINCT appreciationLog.recipientId)', 'count')
      .where('appreciationLog.tenantId = :tenantId', { tenantId })
      .andWhere('appreciationLog.issuerId = :issuerId', { issuerId })
      .getRawOne();

    return parseInt(result.count, 10);
  }

  async countAffectedEmployeesForRecipentId(
    recipientId: string,
    tenantId: string,
  ): Promise<number> {
    const result = await this.appreciationLogRepository
      .createQueryBuilder('appreciationLog')
      .select('COUNT(DISTINCT appreciationLog.issuerId)', 'count')
      .where('appreciationLog.tenantId = :tenantId', { tenantId })
      .andWhere('appreciationLog.recipientId = :recipientId', { recipientId })
      .getRawOne();

    return parseInt(result.count, 10);
  }

  async update(
    id: string,
    updateAppreciationDto: UpdateAppreciationDto,
  ): Promise<AppreciationLog> {
    const appreciationLog = await this.findOne(id);
    if (!appreciationLog) {
      throw new NotFoundException(`AppreciationLog with ID ${id} not found`);
    }

    // Update the issuerId if provided
    if (updateAppreciationDto.issuerId !== undefined) {
      appreciationLog.issuerId = updateAppreciationDto.issuerId;
    }

    // Update the action if provided
    if (updateAppreciationDto.action !== undefined) {
      appreciationLog.action = updateAppreciationDto.action;
    }

    // Update the recipientId if provided
    if (updateAppreciationDto.recipientId !== undefined) {
      appreciationLog.recipientId = updateAppreciationDto.recipientId;
    }

    // Update the issuerId if provided
    if (updateAppreciationDto.issuerId !== undefined) {
      appreciationLog.issuerId = updateAppreciationDto.issuerId;
    }
    // Update the type if provided
    if (updateAppreciationDto.typeId) {
      const recognitionType = await this.recognitionTypeService.findOne(
        updateAppreciationDto.typeId,
      );
      if (!recognitionType) {
        throw new NotFoundException(
          `RecognitionType with ID ${updateAppreciationDto.typeId} not found`,
        );
      }
      appreciationLog.type = recognitionType;
    }

    // Save the updated appreciation log
    await this.appreciationLogRepository.save(appreciationLog);

    // Handle updating the carbon copy entries if `cc` is provided
    if (updateAppreciationDto.cc) {
      // Remove existing carbon copies for this appreciation log
      await this.carbonCopyService.removeByAppreciationLogId(
        appreciationLog.id,
      );

      // Add new carbon copies based on the updated `cc` array
      for (const copyUserId of updateAppreciationDto.cc) {
        await this.carbonCopyService.create(
          { appreciationLogId: appreciationLog.id, copyUserId },
          appreciationLog.tenantId,
        );
      }
    }

    // Return the updated appreciation log
    return await this.findOne(id);
  }

  async remove(id: string): Promise<AppreciationLog> {
    const appreciation = await this.findOne(id);
    return await this.appreciationLogRepository.softRemove(appreciation);
  }
}
