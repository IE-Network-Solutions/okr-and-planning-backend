import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { KeyResult } from './entities/key-result.entity';
import { Connection, QueryRunner, Repository } from 'typeorm';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { MilestonesService } from '../milestones/milestones.service';
import { MetricTypesService } from '../metric-types/metric-types.service';
import { UpdateMilestoneDto } from '../milestones/dto/update-milestone.dto';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';

@Injectable()
export class KeyResultsService {
  constructor(
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    private readonly paginationService: PaginationService,
    private readonly milestonesService: MilestonesService,
    private readonly metricTypeService: MetricTypesService,
    private readonly connection: Connection, // Inject the database connection
    private readonly getFromOrganizatiAndEmployeInfoService: GetFromOrganizatiAndEmployeInfoService,
  ) {}
  async createkeyResult(
    createkeyResultDto: CreateKeyResultDto,
    tenantId: string,
    queryRunner?: QueryRunner,
  ): Promise<KeyResult> {
    try {
      const activeSession =
        await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
          tenantId,
        );
      if (activeSession) {
        createkeyResultDto.sessionId = activeSession.id;
      }
      const keyResult = queryRunner
        ? queryRunner.manager.create(KeyResult, {
            ...createkeyResultDto,
            tenantId,
          })
        : this.keyResultRepository.create({
            ...createkeyResultDto,
            tenantId,
          });
      return queryRunner
        ? await queryRunner.manager.save(KeyResult, keyResult)
        : await this.keyResultRepository.save(keyResult);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async createBulkkeyResult(
    createkeyResultDto: CreateKeyResultDto[],
    tenantId: string,
    objectiveId: string,
    userId: string,
    queryRunner?: QueryRunner,
  ) {
    try {
      const keyResults = await Promise.all(
        createkeyResultDto.map(async (key) => {
          key.objectiveId = objectiveId;
          key['createdBy'] = userId;
          const singleKeyResult = await this.createkeyResult(
            key,
            tenantId,
            queryRunner,
          );
          if (singleKeyResult && singleKeyResult.milestones.length > 0) {
            await this.milestonesService.createBulkMilestone(
              key.milestones,
              tenantId,
              singleKeyResult.id,
              userId,
              queryRunner,
            );
          }
        }),
      );

      return keyResults;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async findAllkeyResults(
    paginationOptions: PaginationDto,
    tenantId: string,
  ): Promise<Pagination<KeyResult>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const activeSession =
        await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
          tenantId,
        );
      const queryBuilder = await this.keyResultRepository
        .createQueryBuilder('keyresult')

        .where('keyresult.tenantId = :tenantId', { tenantId });

      if (activeSession) {
        queryBuilder.andWhere('keyresult.sessionId = :sessionId', {
          sessionId: activeSession.id,
        });
      }

      const paginatedData = await this.paginationService.paginate<KeyResult>(
        queryBuilder,
        options,
      );
      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOnekeyResult(id: string): Promise<KeyResult> {
    try {
      const keyResult = await this.keyResultRepository.findOneOrFail({
        where: { id: id },
        relations: ['milestones'],
      });
      return keyResult;
    } catch (error) {
      throw new NotFoundException(`keyResult Not Found`);
    }
  }

  async updatekeyResult(
    id: string,
    updatekeyResultDto: UpdateKeyResultDto,
    tenantId: string,
  ): Promise<KeyResult> {
    try {
      const keyResult = await this.findOnekeyResult(id);
      if (!keyResult) {
        throw new NotFoundException(`keyResult Not Found`);
      }
      const keyResultTobeUpdated = new UpdateKeyResultDto();
      keyResultTobeUpdated.title = updatekeyResultDto.title;
      keyResultTobeUpdated.deadline = updatekeyResultDto.deadline;
      keyResultTobeUpdated.description = updatekeyResultDto.description;
      keyResultTobeUpdated.initialValue = updatekeyResultDto.initialValue;
      keyResultTobeUpdated.targetValue = updatekeyResultDto.targetValue;
      keyResultTobeUpdated.weight = updatekeyResultDto.weight;
      keyResultTobeUpdated.progress = updatekeyResultDto.progress;
      keyResultTobeUpdated.currentValue = updatekeyResultDto.currentValue;

      //  keyResultTobeUpdated['lastUpdateValue'] = updatekeyResultDto['lastUpdateValue'];

      await this.keyResultRepository.update(
        { id },

        keyResultTobeUpdated,
      );
      if (
        updatekeyResultDto.milestones &&
        updatekeyResultDto.milestones.length > 0
      ) {
        await this.milestonesService.updateMilestones(
          updatekeyResultDto.milestones,
          tenantId,
          updatekeyResultDto.id,
        );
      }
      return await this.findOnekeyResult(id);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async updatekeyResults(
    updatekeyResultDto: UpdateKeyResultDto[],
    tenantId: string,
    objectiveId?: string,
  ): Promise<KeyResult[]> {
    const keyResults = await Promise.all(
      updatekeyResultDto.map(async (key) => {
        if (!key.id) {
          const keResultTobeCreated = new CreateKeyResultDto();
          keResultTobeCreated.title = key.title;
          keResultTobeCreated.deadline = key.deadline;
          keResultTobeCreated.description = key.description;
          keResultTobeCreated.initialValue = key.initialValue;
          keResultTobeCreated.metricTypeId = key.metricTypeId;
          keResultTobeCreated.objectiveId = objectiveId;
          keResultTobeCreated.progress = key.progress;
          keResultTobeCreated.targetValue = key.targetValue;
          keResultTobeCreated.weight = key.weight;
          const keyResultCreated = await this.createkeyResult(
            keResultTobeCreated,
            tenantId,
          );
          key.id = keyResultCreated.id;
        }
        const singleKeyResult = await this.updatekeyResult(
          key.id,
          key,
          tenantId,
        );
        return singleKeyResult;
      }),
    );
    return keyResults;
  }
  async removekeyResult(id: string): Promise<KeyResult> {
    const keyResult = await this.findOnekeyResult(id);
    if (!keyResult) {
      throw new NotFoundException(`keyResult Not found`);
    }
    await this.keyResultRepository.softRemove({ id });
    return keyResult;
  }

  // async updateKeyresultProgress(key: UpdateKeyResultDto) {
  //   let progress
  //   const metricType = await this.metricTypeService.findOneMetricType(key.metricTypeId)

  //   if (metricType.name === NAME.MILESTONE) {
  //     for (const milestone of key.milestones) {
  //       if (milestone.status === Status.COMPLETED) {
  //         progress = progress + milestone.weight
  //       }
  //     }

  //   }
  //   else if (metricType.name === NAME.ACHIEVE) {
  //     progress = progress + key.progress
  //   }
  //   else {
  //     let gg = key.targetValue - key.currentValue
  //     let percent = (gg * 100) / key.targetValue
  //     progress = progress + percent

  //   }
  //   return progress

  // }

  async findAllkeyResultsByUser(
    userId: string,
    tenantId: string,
    paginationOptions: PaginationDto,
  ): Promise<any> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const activeSession =
        await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
          tenantId,
        );
      const queryBuilder = await this.keyResultRepository
        .createQueryBuilder('keyresult')
        .leftJoinAndSelect('keyresult.objective', 'objective')
        .where('objective.userId = :userId', { userId });

      if (activeSession) {
        queryBuilder.andWhere('keyresult.sessionId = :sessionId', {
          sessionId: activeSession.id,
        });
      }

      //queryBuilder.distinctOn(['objective.id'])
      const paginatedData = await this.paginationService.paginate<KeyResult>(
        queryBuilder,
        options,
      );

      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
