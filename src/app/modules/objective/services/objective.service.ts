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
      const objective = await this.objectiveRepository.create({
        ...createObjectiveDto,
        tenantId,
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
    paginationOptions: PaginationDto,
  ): Promise<Pagination<Objective>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const queryBuilder = this.objectiveRepository
        .createQueryBuilder('objective')
        .leftJoinAndSelect('objective.keyResults', 'keyResults')
        .leftJoinAndSelect('keyResults.milestones', 'milestones')
        .leftJoinAndSelect('keyResults.metricType', 'metricType')
        .andWhere('objective.tenantId = :tenantId', { tenantId })
        .where('objective.userId = :userId', { userId });
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
    const Objective = await this.findOneObjective(id);
    if (!Objective) {
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

  async handleUserOkr(
    userId: string,
    tenantId: string,
    token: string,
    paginationOptions?: PaginationDto,
  ): Promise<ViewUserAndSupervisorOKRDto> {
    try {
      const response =
        await this.getFromOrganizatiAndEmployeInfoService.getUsers(
          userId,
          tenantId,
          token,
        );

      const employeeJobInfo = response.employeeJobInformation[0];
      const averageOKrrule =
        await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(
          tenantId,
        );

      const { totalOkr, completedOkr, daysLeft } = await this.calculateUserOKR(
        userId,
        tenantId,
        token,
        employeeJobInfo,
        averageOKrrule,
        paginationOptions,
      );

      const supervisorOkr = response.reportingTo?.id
        ? (
            await this.supervisorOkr(
              response.reportingTo.id,
              tenantId,
              token,
              paginationOptions,
            )
          ).userOkr
        : 0;
      const returnedObject = new ViewUserAndSupervisorOKRDto();
      returnedObject.daysLeft = daysLeft;
      returnedObject.okrCompleted = completedOkr;
      returnedObject.userOkr = totalOkr;
      returnedObject.supervisorOkr = supervisorOkr;

      return returnedObject;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private async calculateUserOKR(
    userId: string,
    tenantId: string,
    token: string,
    employeeJobInfo: JobInformationDto,
    averageOKrrule?: AverageOkrRule,
    paginationOptions?: PaginationDto,
  ) {
    let totalOkr = 0;
    let completedOkr = 0;
    let daysLeft = 0;

    if (employeeJobInfo.departmentLeadOrNot) {
      const departments =
        await this.getFromOrganizatiAndEmployeInfoService.getDepartmentsWithUsers(
          tenantId,
          token,
        );
      const department = departments.find(
        (item) => item.id === employeeJobInfo.departmentId,
      );
      const users = department.users
        .filter((user) => user.id !== userId)
        .map((user) => user.id);

      const [teamObjectives, individualObjectives] = await Promise.all([
        this.findUsersObjectives(tenantId, users),
        this.findAllObjectives(userId, tenantId, paginationOptions),
      ]);

      if (individualObjectives) {
        const individualOKRScore =
          await this.averageOkrCalculation.calculateAverageOkr(
            individualObjectives.items,
          );
        totalOkr +=
          (individualOKRScore.okr * (averageOKrrule?.myOkrPercentage ?? 50)) /
          100;
        daysLeft = individualOKRScore.daysLeft;
        completedOkr = individualOKRScore.okrCompleted;
      }

      if (teamObjectives) {
        const teamOKRScore =
          await this.averageOkrCalculation.calculateAverageOkr(teamObjectives);
        totalOkr +=
          (teamOKRScore.okr * (averageOKrrule?.teamOkrPercentage ?? 50)) / 100;
      }
    } else {
      const individualObjectives = await this.findAllObjectives(
        userId,
        tenantId,
        paginationOptions,
      );
      const individualOKR =
        await this.averageOkrCalculation.calculateAverageOkr(
          individualObjectives.items,
        );
      totalOkr = individualOKR.okr;
      daysLeft = individualOKR.daysLeft;
      completedOkr = individualOKR.okrCompleted;
    }

    return { totalOkr, completedOkr, daysLeft };
  }

  async supervisorOkr(
    userId: string,
    tenantId: string,
    token: string,
    paginationOptions?: PaginationDto,
  ): Promise<ViewUserAndSupervisorOKRDto> {
    const response = await this.getFromOrganizatiAndEmployeInfoService.getUsers(
      userId,
      tenantId,
    );
    const employeeJobInfo = response.employeeJobInformation[0];
    const averageOKrrule =
      await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(tenantId);

    const { totalOkr, completedOkr, daysLeft } = await this.calculateUserOKR(
      userId,
      tenantId,
      token,
      employeeJobInfo,
      averageOKrrule,
      paginationOptions,
    );

    const returnedObject = new ViewUserAndSupervisorOKRDto();
    returnedObject.daysLeft = daysLeft;
    returnedObject.okrCompleted = completedOkr;
    returnedObject.userOkr = totalOkr;
    // returnedObject.supervisorOkr = supervisorOkr;
    return returnedObject;
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
      const queryBuilder = await this.objectiveRepository
        .createQueryBuilder('objective')
        .leftJoinAndSelect('objective.keyResults', 'keyResults')

        .leftJoinAndSelect('keyResults.milestones', 'milestones')
        .leftJoinAndSelect('keyResults.metricType', 'metricType')
        .andWhere('objective.tenantId = :tenantId', { tenantId });

      if (filterDto && filterDto.users.length > 0) {
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
      const paginatedData = await this.paginationService.paginate<Objective>(
        queryBuilder,
        options,
      );
      for (const objective of paginatedData.items) {
        try {
          const user =
            await this.getFromOrganizatiAndEmployeInfoService.getUsers(
              objective.userId,
              tenantId,
            );
          objective['user'] = user;
        } catch {}
      }

      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getTeamOkr(
    tenantId: string,
    filterDto?: FilterObjectiveDto, //| {},
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
      const objectives = await this.objectiveRepository.find({
        where: {
          userId: In(users),
          tenantId: tenantId,
        },
        relations: ['keyResults', 'keyResults.milestones'],
      });
      const objectiveWithProgress =
        await this.averageOkrCalculation.calculateObjectiveProgress(objectives);
      return objectiveWithProgress;
    } catch (error) {}
  }
}
