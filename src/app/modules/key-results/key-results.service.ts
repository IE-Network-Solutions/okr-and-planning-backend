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
import { Connection, In, QueryRunner, Repository } from 'typeorm';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { MilestonesService } from '../milestones/milestones.service';
import { MetricTypesService } from '../metric-types/metric-types.service';
import { UpdateMilestoneDto } from '../milestones/dto/update-milestone.dto';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';
import { Objective } from '../objective/entities/objective.entity';
import { DeleteAndUpdateKeyResultDto } from './dto/delete-update-key-result.dto';
import { NAME } from '../metric-types/enum/metric-type.enum';

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
        cache: false,
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
      let oldKeyResultMetricsType = null;
      let newKeyResultMetricsType = null;

      if (updatekeyResultDto?.metricTypeId) {
        oldKeyResultMetricsType =
          await this.metricTypeService.findOneMetricType(
            keyResult?.metricTypeId,
          );

        newKeyResultMetricsType =
          await this.metricTypeService.findOneMetricType(
            updatekeyResultDto?.metricTypeId,
          );
      }

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
      keyResultTobeUpdated.metricTypeId = updatekeyResultDto.metricTypeId;
      // Only log defined fields for clarity

      const definedUpdatePayload = Object.entries(keyResultTobeUpdated)
        .filter(([notused, v]) => v !== undefined)
        .reduce((acc, [k, v]) => {
          acc[k] = v;
          return acc;
        }, {});
      //  keyResultTobeUpdated['lastUpdateValue'] = updatekeyResultDto['lastUpdateValue'];

      await this.keyResultRepository.update({ id }, definedUpdatePayload);
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
      if (
        oldKeyResultMetricsType.id !== newKeyResultMetricsType.id &&
        oldKeyResultMetricsType?.name === NAME.MILESTONE &&
        newKeyResultMetricsType !== null &&
        oldKeyResultMetricsType !== null
      ) {
        await this.milestonesService.removeMilestoneByKeyresultId(id);
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
  async deleteAndUpdateKeyResults(
    deleteAndUpdateKeyResultDto: DeleteAndUpdateKeyResultDto,
    tenantId: string,
    objectiveId: string,
  ): Promise<KeyResult[]> {
    const queryRunner =
      this.keyResultRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { toBeUpdated, toBeDeleted } = deleteAndUpdateKeyResultDto;
      for (const keyResult of toBeUpdated) {
        await queryRunner.manager.update(KeyResult, keyResult.id, {
          ...keyResult,
        });
      }

      if (toBeDeleted) {
        const entityToDelete = await queryRunner.manager.findOne(KeyResult, {
          where: { id: toBeDeleted },
        });

        if (entityToDelete) {
          await queryRunner.manager.softRemove(entityToDelete);
        } else {
          throw new NotFoundException('KeyResult Not Found');
        }
      }

      await queryRunner.commitTransaction();
      return await queryRunner.manager.find(KeyResult, {
        where: { objectiveId: objectiveId },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`${error.message}`);
    } finally {
      await queryRunner.release();
    }
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

  async updateKeyResultStatusForAllUsers(
    objectives: Objective[],
    tenantId: string,
    isClosed: boolean,
  ) {
    try {
      if (objectives && objectives.length > 0) {
        const objectiveIds = objectives.map((obj) => obj.id);
        const keyResults = await this.updateKeyResultStatus(
          objectiveIds,
          tenantId,
          isClosed,
        );
        const milestones =
          await this.milestonesService.updateMilestoneStatusForAllUsers(
            keyResults,
            tenantId,
            isClosed,
          );

        return keyResults;
      }
    } catch (error) {
      throw new BadRequestException(
        `Failed to update key results: ${error.message}`,
      );
    }
  }

  async updateKeyResultStatus(
    objectiveIds: string[],
    tenantId: string,
    isClosed: boolean,
  ) {
    try {
      const updateResult = await this.keyResultRepository.update(
        { objectiveId: In(objectiveIds), tenantId },
        { isClosed },
      );

      return await this.keyResultRepository.find({
        where: { objectiveId: In(objectiveIds) },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
