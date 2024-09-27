import {
  Connection,
  DataSource,
  In,
  QueryBuilder,
  QueryRunner,
  Repository,
} from 'typeorm';
import { Objective } from './entities/objective.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { KeyResultsService } from '../key-results/key-results.service';
import { MilestonesService } from '../milestones/milestones.service';
import { CreateKeyResultDto } from '../key-results/dto/create-key-result.dto';
import { CreateMilestoneDto } from '../milestones/dto/create-milestone.dto';
import { NAME } from '../metric-types/enum/metric-type.enum';
import { Status } from '../milestones/enum/milestone.status.enum';
import { UpdateKeyResultDto } from '../key-results/dto/update-key-result.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ViewUserAndSupervisorOKRDto } from './dto/view-user-and-supervisor-okr';
import { FilterObjectiveDto } from './dto/filter-objective.dto';
import filterEntities from '@root/src/core/utils/filters.utils';
import { AverageOkrRuleService } from '../average-okr-rule/average-okr-rule.service';
import { TenantManager } from 'firebase-admin/lib/auth/tenant-manager';
import { OkrProgressDto } from './dto/okr-progress.dto';
import { JobInformationDto } from './dto/job-information.dto';
import { AverageOkrRule } from '../average-okr-rule/entities/average-okr-rule.entity';

@Injectable()
export class ObjectiveService {
  private readonly orgUrl: string;
  constructor(
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,

    private readonly paginationService: PaginationService,
    private readonly keyResultService: KeyResultsService,
    private readonly averageOkrRuleService: AverageOkrRuleService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly connection: Connection,
  ) {
    this.orgUrl = this.configService.get<string>('ORG_SERVER');
  }
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
      const calculatedObjectives = await this.calculateObjectiveProgress(
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

  // async calculateAverageOkr(objectives: Objective[]): Promise<OkrProgressDto> {

  //   let completedOkr = 0;
  //   let daysLeft = 0;

  //   let sumOfTeamObjectiveProgress = 0
  //   let okr = 0


  //   for (const objective of objectives) {
  //     sumOfTeamObjectiveProgress = objective['objectiveProgress'] + sumOfTeamObjectiveProgress
  //     if (objective['completedKeyResults'] === objective.keyResults.length) {
  //       completedOkr = completedOkr + 1;
  //     }
  //   }
  //   daysLeft = Math.max(...objectives.map((item) => item['daysLeft']));
  //   okr = (sumOfTeamObjectiveProgress / objectives.length)
  //   let calculatedOkr = new OkrProgressDto
  //   calculatedOkr.daysLeft = daysLeft
  //   calculatedOkr.okr = okr
  //   calculatedOkr.okrCompleted = completedOkr
  //   return calculatedOkr


  // }

  // async handleUserOkr(
  //   userId: string,
  //   tenantId: string,
  //   token: string,
  //   paginationOptions?: PaginationDto,
  // ): Promise<ViewUserAndSupervisorOKRDto> {
  //   try {
  //     let supervisorOkr = 0;
  //     let teamOkr = 0;
  //     let individualOkr = 0;
  //     let totalOkr = 0;
  //     let completedOkr = 0;
  //     let daysLeft = 0;


  //     const response = await this.getUsers(userId, tenantId);

  //     if (response.employeeJobInformation[0].departmentLeadOrNot) {
  //       let users: string[];
  //       const departements = await this.getDepartmentsWithUsers(tenantId, token)
  //       const singledep = departements.find(item => item.id === response.employeeJobInformation[0].departmentId)
  //       for (const user of singledep.users) {
  //         users.push(user.id)
  //       }

  //       const teamObjectives = await this.findUsersObjectives(tenantId, users);
  //       const individualObjectives = await this.findAllObjectives(userId, tenantId, paginationOptions)
  //       if (individualObjectives) {
  //         const individualOKRScore = await this.calculateAverageOkr(individualObjectives.items);
  //         individualOkr = individualOKRScore.okr;
  //         daysLeft = individualOKRScore.daysLeft
  //         completedOkr = individualOKRScore.okrCompleted

  //       }
  //       if (teamObjectives) {
  //         const teamOKRScore = await this.calculateAverageOkr(teamObjectives);
  //         teamOkr = teamOKRScore.okr;

  //       }
  //       const averageOKrrule = await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(tenantId)

  //       if (averageOKrrule) {
  //         totalOkr = teamOkr * averageOKrrule.teamOkrPercentage / 100 + individualOkr * averageOKrrule.myOkrPercentage / 100
  //       }
  //       else {
  //         totalOkr = teamOkr * 50 / 100 + individualOkr * 50 / 100;
  //       }

  //     } else {
  //       const individualObjectives = await this.findAllObjectives(userId, tenantId, paginationOptions)

  //       const individualOKR = await this.calculateAverageOkr(individualObjectives.items);
  //       totalOkr = individualOKR.okr;
  //       daysLeft = individualOKR.daysLeft
  //       completedOkr = individualOKR.okrCompleted
  //     }

  //     if (response) {
  //       const supervisorOkrProgress = await this.findAllObjectives(response.reportingTo.id, tenantId, paginationOptions)

  //       const individualOKR = await this.calculateAverageOkr(supervisorOkrProgress.items);

  //       supervisorOkr = individualOKR.okr
  //     }

  //     const returnedObject = new ViewUserAndSupervisorOKRDto();
  //     returnedObject.daysLeft = daysLeft
  //     returnedObject.okrCompleted = completedOkr;
  //     returnedObject.userOkr = totalOkr;
  //     returnedObject.supervisorOkr = supervisorOkr;

  //     return returnedObject;
  //   } catch (error) {
  //     console.error('Error calculating OKR:', error.message);
  //     throw new Error('Failed to calculate OKR');
  //   }
  // }

  // async calculateAverageOkr(objectives: Objective[]): Promise<OkrProgressDto> {
  //   let completedOkr = 0;
  //   let sumOfTeamObjectiveProgress = 0;

  //   for (const objective of objectives) {
  //     console.log(objective['objectiveProgress'], "individualObjectives")
  //     sumOfTeamObjectiveProgress += objective['objectiveProgress'];
  //     if (objective['completedKeyResults'] === objective.keyResults.length) {
  //       completedOkr++;
  //     }
  //   }
  //   const daysLeft = Math.max(...objectives.map(item => item['daysLeft']));
  //   const okr = sumOfTeamObjectiveProgress / objectives.length;
  //   let calculatedOkr = new OkrProgressDto
  //   calculatedOkr.daysLeft = daysLeft
  //   calculatedOkr.okr = okr
  //   calculatedOkr.okrCompleted = completedOkr
  //   return calculatedOkr
  // }

  // async handleUserOkr(
  //   userId: string,
  //   tenantId: string,
  //   token: string,
  //   paginationOptions?: PaginationDto,
  // ): Promise<ViewUserAndSupervisorOKRDto> {
  //   try {
  //     let supervisorOkr = 0;
  //     let totalOkr = 0;
  //     let completedOkr = 0;
  //     let daysLeft = 0;
  //     const response = await this.getUsers(userId, tenantId);
  //     const employeeJobInfo = response.employeeJobInformation[0];
  //     const averageOKrrule = await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(tenantId);
  //     if (employeeJobInfo.departmentLeadOrNot) {

  //       const departements = await this.getDepartmentsWithUsers(tenantId, token);
  //       const department = departements.find(item => item.id === employeeJobInfo.departmentId);
  //       console.log(department.users, "department")
  //       const users = department.users
  //         .filter(user => user.id !== userId)  // Exclude the specific userId
  //         .map(user => user.id);

  //       console.log(users, "department")

  //       const [teamObjectives, individualObjectives] = await Promise.all([
  //         this.findUsersObjectives(tenantId, users),
  //         this.findAllObjectives(userId, tenantId, paginationOptions),
  //       ]);

  //       if (individualObjectives) {
  //         console.log(individualObjectives, "individualObjectives")
  //         const individualOKRScore = await this.calculateAverageOkr(individualObjectives.items);
  //         totalOkr += individualOKRScore.okr * (averageOKrrule?.myOkrPercentage ?? 50) / 100;
  //         daysLeft = individualOKRScore.daysLeft;
  //         completedOkr = individualOKRScore.okrCompleted;
  //       }

  //       if (teamObjectives) {
  //         console.log(teamObjectives, "teamObjectives")

  //         const teamOKRScore = await this.calculateAverageOkr(teamObjectives);
  //         totalOkr += teamOKRScore.okr * (averageOKrrule?.teamOkrPercentage ?? 50) / 100;
  //       }
  //     } else {
  //       const individualObjectives = await this.findAllObjectives(userId, tenantId, paginationOptions);
  //       const individualOKR = await this.calculateAverageOkr(individualObjectives.items);
  //       totalOkr = individualOKR.okr;
  //       daysLeft = individualOKR.daysLeft;
  //       completedOkr = individualOKR.okrCompleted;
  //     }
  //     if (response.reportingTo?.id) {
  //       const supervisorOkrProgress = await this.supervisorOkr(response.reportingTo?.id, tenantId, token, paginationOptions)

  //       supervisorOkr = supervisorOkrProgress.userOkr;
  //     }
  //     const returnedObject = new ViewUserAndSupervisorOKRDto();
  //     returnedObject.daysLeft = daysLeft
  //     returnedObject.okrCompleted = completedOkr;
  //     returnedObject.userOkr = totalOkr;
  //     returnedObject.supervisorOkr = supervisorOkr;

  //     return returnedObject;
  //   } catch (error) {
  //     console.error('Error calculating OKR:', error.message);
  //     throw new Error('Failed to calculate OKR');
  //   }
  // }

  // async supervisorOkr(userId: string,
  //   tenantId: string,
  //   token: string,
  //   paginationOptions?: PaginationDto) {
  //   let supervisorOkr = 0;
  //   let totalOkr = 0;
  //   let completedOkr = 0;
  //   let daysLeft = 0;
  //   const response = await this.getUsers(userId, tenantId);
  //   const employeeJobInfo = response.employeeJobInformation[0];
  //   const averageOKrrule = await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(tenantId);
  //   if (employeeJobInfo.departmentLeadOrNot) {

  //     const departements = await this.getDepartmentsWithUsers(tenantId, token);
  //     const department = departements.find(item => item.id === employeeJobInfo.departmentId);
  //     console.log(department.users, "department")
  //     const users = department.users
  //       .filter(user => user.id !== userId)  // Exclude the specific userId
  //       .map(user => user.id);

  //     console.log(users, "department")

  //     const [teamObjectives, individualObjectives] = await Promise.all([
  //       this.findUsersObjectives(tenantId, users),
  //       this.findAllObjectives(userId, tenantId, paginationOptions),
  //     ]);

  //     if (individualObjectives) {
  //       console.log(individualObjectives, "individualObjectives")
  //       const individualOKRScore = await this.calculateAverageOkr(individualObjectives.items);
  //       totalOkr += individualOKRScore.okr * (averageOKrrule?.myOkrPercentage ?? 50) / 100;
  //       daysLeft = individualOKRScore.daysLeft;
  //       completedOkr = individualOKRScore.okrCompleted;
  //     }

  //     if (teamObjectives) {
  //       console.log(teamObjectives, "teamObjectives")

  //       const teamOKRScore = await this.calculateAverageOkr(teamObjectives);
  //       totalOkr += teamOKRScore.okr * (averageOKrrule?.teamOkrPercentage ?? 50) / 100;
  //     }
  //   } else {
  //     const individualObjectives = await this.findAllObjectives(userId, tenantId, paginationOptions);
  //     const individualOKR = await this.calculateAverageOkr(individualObjectives.items);
  //     totalOkr = individualOKR.okr;
  //     daysLeft = individualOKR.daysLeft;
  //     completedOkr = individualOKR.okrCompleted;
  //   }

  //   const returnedObject = new ViewUserAndSupervisorOKRDto();
  //   returnedObject.daysLeft = daysLeft
  //   returnedObject.okrCompleted = completedOkr;
  //   returnedObject.userOkr = totalOkr;
  //   // returnedObject.supervisorOkr = supervisorOkr;

  //   return returnedObject;


  // }



  async calculateAverageOkr(objectives: Objective[]): Promise<OkrProgressDto> {
    const completedOkr = objectives.filter(objective =>
      objective['completedKeyResults'] === objective.keyResults.length
    ).length;

    const sumOfTeamObjectiveProgress = objectives.reduce((sum, objective) => {
      console.log(objective['objectiveProgress'], "individualObjectives");
      return sum + objective['objectiveProgress'];
    }, 0);

    const daysLeft = Math.max(...objectives.map(item => item['daysLeft']));

    let calculatedOkr = new OkrProgressDto
    calculatedOkr.daysLeft = daysLeft
    calculatedOkr.okr = objectives.length ? sumOfTeamObjectiveProgress / objectives.length : 0,
      calculatedOkr.okrCompleted = completedOkr
    return calculatedOkr
  }

  async handleUserOkr(
    userId: string,
    tenantId: string,
    token: string,
    paginationOptions?: PaginationDto,
  ): Promise<ViewUserAndSupervisorOKRDto> {
    try {
      const response = await this.getUsers(userId, tenantId);
      const employeeJobInfo = response.employeeJobInformation[0];
      const averageOKrrule = await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(tenantId);

      const { totalOkr, completedOkr, daysLeft } = await this.calculateUserOKR(
        userId,
        tenantId,
        token,
        employeeJobInfo,
        averageOKrrule,
        paginationOptions
      );

      const supervisorOkr = response.reportingTo?.id
        ? (await this.supervisorOkr(response.reportingTo.id, tenantId, token, paginationOptions)).userOkr
        : 0;
      const returnedObject = new ViewUserAndSupervisorOKRDto();
      returnedObject.daysLeft = daysLeft
      returnedObject.okrCompleted = completedOkr;
      returnedObject.userOkr = totalOkr;
      returnedObject.supervisorOkr = supervisorOkr;

      return returnedObject;
    } catch (error) {
      console.error('Error calculating OKR:', error.message);
      throw new Error('Failed to calculate OKR');
    }
  }

  private async calculateUserOKR(
    userId: string,
    tenantId: string,
    token: string,
    employeeJobInfo: JobInformationDto,
    averageOKrrule?: AverageOkrRule,
    paginationOptions?: PaginationDto
  ) {
    let totalOkr = 0;
    let completedOkr = 0;
    let daysLeft = 0;

    if (employeeJobInfo.departmentLeadOrNot) {
      const departments = await this.getDepartmentsWithUsers(tenantId, token);
      const department = departments.find(item => item.id === employeeJobInfo.departmentId);
      const users = department.users.filter(user => user.id !== userId).map(user => user.id);

      const [teamObjectives, individualObjectives] = await Promise.all([
        this.findUsersObjectives(tenantId, users),
        this.findAllObjectives(userId, tenantId, paginationOptions),
      ]);

      if (individualObjectives) {
        const individualOKRScore = await this.calculateAverageOkr(individualObjectives.items);
        totalOkr += individualOKRScore.okr * (averageOKrrule?.myOkrPercentage ?? 50) / 100;
        daysLeft = individualOKRScore.daysLeft;
        completedOkr = individualOKRScore.okrCompleted;
      }

      if (teamObjectives) {
        const teamOKRScore = await this.calculateAverageOkr(teamObjectives);
        totalOkr += teamOKRScore.okr * (averageOKrrule?.teamOkrPercentage ?? 50) / 100;
      }
    } else {
      const individualObjectives = await this.findAllObjectives(userId, tenantId, paginationOptions);
      const individualOKR = await this.calculateAverageOkr(individualObjectives.items);
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
    paginationOptions?: PaginationDto
  ): Promise<ViewUserAndSupervisorOKRDto> {
    const response = await this.getUsers(userId, tenantId);
    const employeeJobInfo = response.employeeJobInformation[0];
    const averageOKrrule = await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(tenantId);

    const { totalOkr, completedOkr, daysLeft } = await this.calculateUserOKR(
      userId,
      tenantId,
      token,
      employeeJobInfo,
      averageOKrrule,
      paginationOptions
    );

    const returnedObject = new ViewUserAndSupervisorOKRDto();
    returnedObject.daysLeft = daysLeft
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
      console.log(filterDto, " filterDto.users")
      const queryBuilder = await this.objectiveRepository
        .createQueryBuilder('objective')
        .leftJoinAndSelect('objective.keyResults', 'keyResults')

        .leftJoinAndSelect('keyResults.milestones', 'milestones')
        .leftJoinAndSelect('keyResults.metricType', 'metricType')
        .andWhere('objective.tenantId = :tenantId', { tenantId });

      if (filterDto && filterDto.users.length > 0) {
        console.log(filterDto, " filterDto.users3")
        //  filterDto.users.

        queryBuilder.andWhere('objective.userId IN (:...userIds)', { userIds: filterDto.users });
      }

      if (filterDto && filterDto.userId) {
        console.log(filterDto, " filterDto.users1")

        const userId = filterDto.userId
        queryBuilder.andWhere('objective.userId = :userId', { userId });

      }

      if (filterDto && filterDto.metricTypeId) {
        console.log(filterDto, " filterDto.users2")

        queryBuilder.andWhere('keyResults.metricTypeId = :metricTypeId', {
          metricTypeId: filterDto.metricTypeId,
        });
      }

      // queryBuilder.distinctOn(['objective.id'])
      const paginatedData = await this.paginationService.paginate<Objective>(
        queryBuilder,
        options,
      );
      console.log(paginatedData.items.length, "totototototo")
      for (const objective of paginatedData.items) {
        try {
          const user = await this.getUsers(objective.userId, tenantId);
          objective['user'] = user;
        } catch {

        }
      }

      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getTeamOkr(
    tenantId: string,
    filterDto?: FilterObjectiveDto | {},
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
          const newObjective = await this.calculateObjectiveProgress(
            objectives.items,
          );


          return {
            ...objectives,
            items: newObjective,
          };
        }
        return objectives


      }
      return {
        items: [],
        meta: {
          total: 0,
          itemCount: 0,
          perPage: paginationOptions?.limit || 0,
          itemsPerPage: paginationOptions?.limit || 0, // Added `itemsPerPage` to match the required type
          totalPages: 0,
          currentPage: paginationOptions?.page || 0,
        },

      }

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getCompanyOkr(
    tenantId: string,
    userId: string,
    filterDto?: FilterObjectiveDto | {},

    paginationOptions?: PaginationDto,
  ): Promise<Pagination<Objective>> {
    try {

      const paginatedData = await this.objectiveFilter(
        tenantId,
        filterDto,
        paginationOptions,
      );
      if (paginatedData.items.length > 0) {
        const newObjective = await this.calculateObjectiveProgress(
          paginatedData.items,
        );
        // const filtere = newObjective.filter(
        //   (item) => item.userId !== userId,
        // );

        return {
          ...paginatedData,
          items: newObjective,
        }
      }
      return paginatedData

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async getUsers(userId: string, tenantId: string) {
    const response = await this.httpService
      .get(`http://localhost:8008/api/v1/users/${userId}`, {
        headers: {
          tenantid: tenantId,
        },
      })
      .toPromise();
    return response.data;
  }

  async getDepartmentsWithUsers(tenantId: string, token: string) {
    const response = await this.httpService
      .get(`http://localhost:8008/api/v1/users/all/departments`, {
        headers: {
          tenantid: tenantId,
        },
      })
      .toPromise();
    return response.data;
  }
  // async calculateObjectiveProgress(objectives: Objective[]) {
  //   objectives.forEach((objective) => {
  //     let totalProgress = 0;
  //     let completedKeyResults = 0;
  //     const daysLeft = Math.ceil(
  //       (new Date(objective.deadline).getTime() - Date.now()) /
  //       (1000 * 60 * 60 * 24),
  //     );

  //     objective['daysLeft'] = daysLeft;
  //     objective.keyResults.forEach((keyResult) => {
  //       let keyResultProgress = 0;
  //       totalProgress = totalProgress + (keyResult.progress * keyResult.weight) / 100;
  //       if (keyResult.progress === 100) {
  //         completedKeyResults = completedKeyResults + 1;
  //       }
  //       // keyResult.milestones.forEach((milestone) => {
  //       //   if (milestone.status === Status.COMPLETED) {
  //       //     keyResultProgress = keyResultProgress + 1;
  //       //   }
  //       // });
  //       // keyResult['keyResultProgress'] = keyResultProgress;
  //     });
  //     objective['objectiveProgress'] =
  //       totalProgress;
  //     objective['completedKeyResults'] = completedKeyResults;
  //   });
  //   return objectives;
  // }

  async calculateObjectiveProgress(objectives: Objective[]): Promise<Objective[]> {
    console.log(objectives.length, "length")

    return objectives.map((objective) => {
      let totalProgress = 0;
      let completedKeyResults = 0;

      const daysLeft = Math.ceil(
        (new Date(objective.deadline).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
      );

      objective.keyResults.forEach((keyResult) => {
        console.log(keyResult.progress * keyResult.weight / 100, "each")
        totalProgress += (keyResult.progress * keyResult.weight) / 100;

        if (keyResult.progress === 100) {
          console.log(keyResult.progress, "(keyResult.progress")
          completedKeyResults++;
        }
      });

      return {
        ...objective,
        daysLeft,
        objectiveProgress: totalProgress,
        completedKeyResults,
      };
    });
  }



  async findUsersObjectives(
    tenantId: string,
    users: string[]

  ): Promise<Objective[]> {
    try {

      const objectives = await this.objectiveRepository.find({
        where: {
          userId: In(users),
          tenantId: tenantId
        },
        relations: ['keyResults', 'keyResults.milestones']
      });
      console.log(objectives, "teamobbbbb")
      const objectiveWithProgress = await this.calculateObjectiveProgress(objectives)
      return objectiveWithProgress
    } catch (error) { }
  }
}
