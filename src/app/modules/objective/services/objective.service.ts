import {
  Connection,
  DataSource,
  In,
  QueryBuilder,
  QueryRunner,
  Repository,
} from 'typeorm';
import { Objective } from '../entities/objective.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateObjectiveDto } from '../dto/create-objective.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UpdateObjectiveDto } from '../dto/update-objective.dto';
import { KeyResultsService } from '../../key-results/key-results.service';
import { MilestonesService } from '../../milestones/milestones.service';
import { CreateKeyResultDto } from '../../key-results/dto/create-key-result.dto';
import { CreateMilestoneDto } from '../../milestones/dto/create-milestone.dto';
import { NAME } from '../../metric-types/enum/metric-type.enum';
import { Status } from '../../milestones/enum/milestone.status.enum';
import { UpdateKeyResultDto } from '../../key-results/dto/update-key-result.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ViewUserAndSupervisorOKRDto } from '../dto/view-user-and-supervisor-okr';
import { FilterObjectiveDto } from '../dto/filter-objective.dto';
import filterEntities from '@root/src/core/utils/filters.utils';
import { AverageOkrRuleService } from '../../average-okr-rule/average-okr-rule.service';
import { TenantManager } from 'firebase-admin/lib/auth/tenant-manager';
import { OkrProgressDto } from '../dto/okr-progress.dto';
import { JobInformationDto } from '../dto/job-information.dto';
import { AverageOkrRule } from '../../average-okr-rule/entities/average-okr-rule.entity';
import { EmptyPaginationDto } from '@root/src/core/commonDto/return-empty-paginated.dto';
import { GetFromOrganizatiAndEmployeInfoService } from './get-data-from-org.service';
import { AverageOkrCalculation } from './average-okr-calculation.service';
import { UpdateObjectiveStatusDto } from '../dto/update-objective-status.dto';

@Injectable()
export class ObjectiveService {
  constructor(
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,
    private readonly paginationService: PaginationService,
    private readonly keyResultService: KeyResultsService,
    private readonly averageOkrRuleService: AverageOkrRuleService,
    private readonly getFromOrganizatiAndEmployeInfoService: GetFromOrganizatiAndEmployeInfoService,
    private readonly averageOkrCalculation: AverageOkrCalculation,
    private readonly connection: Connection,
  ) {}

  async createObjective(
    createObjectiveDto: CreateObjectiveDto,
    tenantId: string,
  ): Promise<Objective> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const activeSession =
        await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
          tenantId,
        );
      if (activeSession) {
        createObjectiveDto.sessionId = activeSession.id;
      }

      if (
        createObjectiveDto.allignedKeyResultId === '' ||
        createObjectiveDto.allignedKeyResultId === undefined
      ) {
        createObjectiveDto.allignedKeyResultId = null;
      }
      const objective = await this.objectiveRepository.create({
        ...createObjectiveDto,
        tenantId,
        createdBy: createObjectiveDto.userId,
      });
      const savedObjective = await queryRunner.manager.save(
        Objective,
        objective,
      );
      if (savedObjective && createObjectiveDto.keyResults.length > 0) {
        await this.keyResultService.createBulkkeyResult(
          createObjectiveDto.keyResults,
          tenantId,
          savedObjective.id,
          createObjectiveDto.userId,
          queryRunner,
        );
      }
      await queryRunner.commitTransaction();
      return savedObjective;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
  async findAllObjectives(
    userId: string,
    tenantId: string,
    filterDto?: FilterObjectiveDto,
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<Objective>> {
    try {
      const activeSession =
        await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
          tenantId,
        );
      const options: IPaginationOptions = {
        page: paginationOptions?.page,
        limit: paginationOptions?.limit,
      };
      const queryBuilder = this.objectiveRepository
        .createQueryBuilder('objective')
        .leftJoinAndSelect('objective.keyResults', 'keyResults')
        .leftJoinAndSelect('keyResults.milestones', 'milestones')
        .leftJoinAndSelect('keyResults.metricType', 'metricType')
        .andWhere('objective.tenantId = :tenantId', { tenantId })
        .where('objective.userId = :userId', { userId });

      if (filterDto && filterDto.metricTypeId) {
        queryBuilder.andWhere('keyResults.metricTypeId = :metricTypeId', {
          metricTypeId: filterDto.metricTypeId,
        });
      }
      if (activeSession) {
        queryBuilder.andWhere('objective.sessionId = :sessionId', {
          sessionId: activeSession.id,
        });
      }

      const paginatedData = await this.paginationService.paginate<Objective>(
        queryBuilder,
        options,
      );

      const calculatedObjectives =
        await this.averageOkrCalculation.calculateObjectiveProgress(
          paginatedData.items,
        );

      return {
        ...paginatedData,
        items: calculatedObjectives,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneObjective(id: string): Promise<Objective> {
    try {
      const Objective = await this.objectiveRepository.findOne({
        where: { id: id },
        relations: ['keyResults', 'keyResults.milestones'],
      });
      return Objective;
    } catch (error) {
      throw new NotFoundException(`Objective Not Found`);
    }
  }

  async updateObjective(
    id: string,
    updateObjectiveDto: UpdateObjectiveDto,
    tenantId: string,
  ): Promise<Objective> {
    const objective = await this.findOneObjective(id);
    if (!objective) {
      throw new NotFoundException(`Objective Not Found`);
    }
    let keyResults: UpdateKeyResultDto[] = [];
    keyResults = updateObjectiveDto.keyResults;
    delete updateObjectiveDto.keyResults;
    await this.objectiveRepository.update({ id }, updateObjectiveDto);
    if (keyResults.length > 0) {
      await this.keyResultService.updatekeyResults(keyResults, tenantId, id);
    }
    return await this.findOneObjective(id);
  }

  async updateObjectives(
    id: string,
    updateObjectiveDto: UpdateObjectiveDto,
  ): Promise<Objective> {
    const Objective = await this.findOneObjective(id);
    if (!Objective) {
      throw new NotFoundException(`Objective Not Found`);
    }

    await this.objectiveRepository.update(
      { id },

      updateObjectiveDto,
    );

    return await this.findOneObjective(id);
  }

  async removeObjective(id: string): Promise<Objective> {
    const objective = await this.findOneObjective(id);
    if (!objective) {
      throw new NotFoundException(`Objective Not Found`);
    }
    await this.objectiveRepository.softRemove({ id });
    return objective;
  }
  async objectiveFilter(
    tenantId: string,
    filterDto?: FilterObjectiveDto,
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<Objective>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const activeSession =
        await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
          tenantId,
        );

      const queryBuilder = await this.objectiveRepository
        .createQueryBuilder('objective')
        .leftJoinAndSelect('objective.keyResults', 'keyResults')

        .leftJoinAndSelect('keyResults.milestones', 'milestones')
        .leftJoinAndSelect('keyResults.metricType', 'metricType')
        .andWhere('objective.tenantId = :tenantId', { tenantId });

      if (filterDto.users && filterDto.users.length > 0) {
        queryBuilder.andWhere('objective.userId IN (:...userIds)', {
          userIds: filterDto.users,
        });
      }

      if (filterDto && filterDto.userId) {
        const userId = filterDto.userId;
        queryBuilder.andWhere('objective.userId = :userId', { userId });
      }

      if (filterDto && filterDto.metricTypeId) {
        queryBuilder.andWhere('keyResults.metricTypeId = :metricTypeId', {
          metricTypeId: filterDto.metricTypeId,
        });
      }
      if (activeSession) {
        queryBuilder.andWhere('objective.sessionId = :sessionId', {
          sessionId: activeSession.id,
        });
      }
      const paginatedData = await this.paginationService.paginate<Objective>(
        queryBuilder,
        options,
      );
      if (paginatedData.items.length > 0) {
        for (const objective of paginatedData.items) {
          try {
            const user =
              await this.getFromOrganizatiAndEmployeInfoService.getUsers(
                objective.userId,
                tenantId,
              );
            objective['user'] = user;
          } catch (error) {}
        }
      }
      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getTeamOkr(
    tenantId: string,
    filterDto?: FilterObjectiveDto,
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<Objective>> {
    try {
      if (filterDto && filterDto['users'].length > 0) {
        const objectives = await this.objectiveFilter(
          tenantId,
          filterDto,
          paginationOptions,
        );
        if (objectives.items.length > 0) {
          const newObjective =
            await this.averageOkrCalculation.calculateObjectiveProgress(
              objectives.items,
            );

          return {
            ...objectives,
            items: newObjective,
          };
        }
        return objectives;
      }
      return EmptyPaginationDto.createEmptyPaginationResult(paginationOptions);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getCompanyOkr(
    tenantId: string,
    userId: string,
    filterDto?: FilterObjectiveDto, // | {},

    paginationOptions?: PaginationDto,
  ): Promise<Pagination<Objective>> {
    try {
      const paginatedData = await this.objectiveFilter(
        tenantId,
        filterDto,
        paginationOptions,
      );
      if (paginatedData.items.length > 0) {
        const newObjective =
          await this.averageOkrCalculation.calculateObjectiveProgress(
            paginatedData.items,
          );
        // const filter = newObjective.filter(
        //   (item) => item.userId !== userId,
        // );

        return {
          ...paginatedData,
          items: newObjective,
        };
      }
      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findUsersObjectives(
    tenantId: string,
    users: string[],
  ): Promise<Objective[]> {
    try {
      const activeSession =
        await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
          tenantId,
        );
      const queryConditions: any = {
        where: {
          userId: In(users),
          tenantId: tenantId,
        },
        relations: ['keyResults', 'keyResults.milestones'],
      };

      if (activeSession) {
        queryConditions.where.sessionId = activeSession.id;
      }
      const objectives = await this.objectiveRepository.find(queryConditions);
      const objectiveWithProgress =
        await this.averageOkrCalculation.calculateObjectiveProgress(objectives);
      return objectiveWithProgress;
    } catch (error) {}
  }
  async updateObjectiveStatusForAllUsers(updateObjectiveStatusDto: UpdateObjectiveStatusDto, tenantId: string) {
    try {
      const { sessionId, isClosed, userId } = updateObjectiveStatusDto;
      const objectives = userId
        ? await this.updateObjectiveByUserId(sessionId, tenantId, isClosed, userId)
        : await this.updateObjectiveBySessionId(sessionId, tenantId, isClosed);
      await this.keyResultService.updateKeyResultStatusForAllUsers(objectives, tenantId, isClosed);
  
      return this.objectiveRepository.find({
        where: userId ? { tenantId, sessionId, userId } : { tenantId, sessionId },
       
      });
  
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateObjectiveBySessionId(sessionId:string,tenantId:string,isClosed:boolean) {
    try {
    
      if(sessionId  && tenantId){
        const objective = await this.objectiveRepository.update(
          { tenantId: tenantId, sessionId: sessionId },  
          { isClosed: isClosed }
        );       
    return await this.objectiveRepository.find({
          where: { tenantId, sessionId },
        });
       
      }
      
    } catch (error) {
      throw new BadRequestException(error.message);

    }

  }

  async updateObjectiveByUserId(sessionId:string,tenantId:string,isClosed:boolean,userId:string) {
    try {
    
      if(sessionId  && tenantId && userId){
        const objective = await this.objectiveRepository.update(
          { tenantId: tenantId, sessionId: sessionId,userId:userId },  
          { isClosed: isClosed }
        );
       
       return await this.objectiveRepository.find({
          where: { tenantId, sessionId, userId},
        });
      
      }
      
    } catch (error) {
      throw new BadRequestException(error.message);

    }

  }
}