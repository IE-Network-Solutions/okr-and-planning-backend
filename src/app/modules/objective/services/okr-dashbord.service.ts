import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AverageOkrCalculation } from './average-okr-calculation.service';
import { FilterObjectiveDto } from '../dto/filter-objective.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Objective } from '../entities/objective.entity';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { GetFromOrganizatiAndEmployeInfoService } from './get-data-from-org.service';
import { ViewUserAndSupervisorOKRDto } from '../dto/view-user-and-supervisor-okr';
import { AverageOkrRuleService } from '../../average-okr-rule/average-okr-rule.service';
import { JobInformationDto } from '../dto/job-information.dto';
import { AverageOkrRule } from '../../average-okr-rule/entities/average-okr-rule.entity';
import { ObjectiveService } from './objective.service';
import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';

@Injectable()
export class OKRDashboardService {
  constructor(
    private readonly averageOkrCalculation: AverageOkrCalculation,
    private readonly getFromOrganizatiAndEmployeInfoService: GetFromOrganizatiAndEmployeInfoService,
    private readonly averageOkrRuleService: AverageOkrRuleService,
    private readonly objectiveService: ObjectiveService,
  ) {}
  async handleUserOkr(
    userId: string,
    tenantId: string,
    paginationOptions?: PaginationDto,
  ): Promise<ViewUserAndSupervisorOKRDto> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const response =
        await this.getFromOrganizatiAndEmployeInfoService.getUsers(
          userId,
          tenantId,
        );

      const employeeJobInfo = response.employeeJobInformation[0];

      const averageOKrrule =
        await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(
          tenantId,
        );
      const {
        totalOkr,
        completedOkr,
        daysLeft,
        keyResultCount,
        teamOkr,
        companyOkr,
      } = await this.calculateUserOKR(
        userId,
        tenantId,
        employeeJobInfo,
        averageOKrrule,
        paginationOptions,
      );

      const supervisorOkr = response.reportingTo?.id
        ? (
            await this.supervisorOkr(
              response.reportingTo.id,
              tenantId,
              paginationOptions,
            )
          ).userOkr
        : 0;

      const returnedObject = new ViewUserAndSupervisorOKRDto();
      returnedObject.daysLeft = daysLeft;
      returnedObject.okrCompleted = completedOkr;
      returnedObject.userOkr = totalOkr;
      returnedObject.supervisorOkr = supervisorOkr;
      returnedObject.keyResultCount = keyResultCount;
      returnedObject.teamOkr = teamOkr;
      returnedObject.companyOkr = companyOkr;

      return returnedObject;
    } catch (error) {
      throw new Error(error);
    }
  }
  private async calculateUserOKR(
    userId: string,
    tenantId: string,
    employeeJobInfo: JobInformationDto,
    averageOKrrule?: AverageOkrRule,
    paginationOptions?: PaginationDto,
  ) {
    try {
      let totalOkr = 0;
      let completedOkr = 0;
      let daysLeft = 0;
      let keyResultCount = 0;
      let teamOkr = 0;
      let companyOkr = 0;

      const departments =
        await this.getFromOrganizatiAndEmployeInfoService.getDepartmentsWithUsers(
          tenantId,
        );

      const department = departments.find(
        (item) => item.id === employeeJobInfo.departmentId,
      );
      const users = department.users
        .filter((user) => user.id !== userId)
        .map((user) => user.id);
      const [teamObjectives, individualObjectives, companyObjective] =
        await Promise.all([
          this.objectiveService.findUsersObjectives(tenantId, users),
          this.objectiveService.findAllObjectives(
            userId,
            tenantId,
            null,
            paginationOptions,
          ),
          this.objectiveService.getCompanyOkr(
            tenantId,
            userId,
            null,
            paginationOptions,
          ),
        ]);
      const individualOKRScore =
        await this.averageOkrCalculation.calculateAverageOkr(
          individualObjectives.items,
        );
      if (employeeJobInfo.departmentLeadOrNot) {
        totalOkr +=
          (individualOKRScore.okr * (averageOKrrule?.myOkrPercentage ?? 50)) /
          100;
        daysLeft = individualOKRScore.daysLeft;
        completedOkr = individualOKRScore.okrCompleted;

        if (teamObjectives) {
          const teamOKRScore =
            await this.averageOkrCalculation.calculateAverageOkr(
              teamObjectives,
            );
          teamOkr = teamOKRScore.okr;
          totalOkr +=
            (teamOKRScore.okr * (averageOKrrule?.teamOkrPercentage ?? 50)) /
            100;
        }
      } else {
        totalOkr = individualOKRScore.okr;
        daysLeft = individualOKRScore.daysLeft;
        completedOkr = individualOKRScore.okrCompleted;
        keyResultCount = individualOKRScore.keyResultcount;

        if (teamObjectives) {
          const teamOKRScore =
            await this.averageOkrCalculation.calculateAverageOkr(
              teamObjectives,
            );
          teamOkr = teamOKRScore.okr;
        }
      }
      const progressSum = companyObjective.items.reduce(
        (sum, item) => sum + (item['objectiveProgress'] || 0),
        0,
      );
      companyOkr = progressSum / companyObjective.items.length;
      return {
        totalOkr,
        completedOkr,
        daysLeft,
        keyResultCount,
        teamOkr,
        companyOkr,
      };
    } catch (error) {
      return {
        totalOkr: 0,
        completedOkr: 0,
        daysLeft: 0,
        keyResultCount: 0,
        teamOkr: 0,
        companyOkr: 0,
      };
    }
  }

  async supervisorOkr(
    userId: string,
    tenantId: string,
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
      employeeJobInfo,
      averageOKrrule,
      paginationOptions,
    );

    const returnedObject = new ViewUserAndSupervisorOKRDto();
    returnedObject.daysLeft = daysLeft;
    returnedObject.okrCompleted = completedOkr;
    returnedObject.userOkr = totalOkr;
    return returnedObject;
  }
  async getOkrOfSingleUser(
    userId: string,
    tenantId: string,
    paginationOptions?: PaginationDto,
  ): Promise<number> {
    try {
      const response =
        await this.getFromOrganizatiAndEmployeInfoService.getUsers(
          userId,
          tenantId,
        );
      const employeeJobInfo = response.employeeJobInformation[0];
      const averageOKrrule =
        await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(
          tenantId,
        );

      const {
        totalOkr,
        completedOkr,
        daysLeft,
        keyResultCount,
        teamOkr,
        companyOkr,
      } = await this.calculateUserOKR(
        userId,
        tenantId,
        employeeJobInfo,
        averageOKrrule,
        paginationOptions,
      );
      return totalOkr;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getOkrOfSupervisor(
    userId: string,
    tenantId: string,
    paginationOptions?: PaginationDto,
  ): Promise<number> {
    try {
      const response =
        await this.getFromOrganizatiAndEmployeInfoService.getUsers(
          userId,
          tenantId,
        );
      const supervisorOkr = response.reportingTo?.id
        ? (
            await this.supervisorOkr(
              response.reportingTo.id,
              tenantId,
              paginationOptions,
            )
          ).userOkr
        : 0;

      return supervisorOkr;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getOkrOfTeam(
    userId: string,
    tenantId: string,
    paginationOptions?: PaginationDto,
  ): Promise<number> {
    try {
      const response =
        await this.getFromOrganizatiAndEmployeInfoService.getUsers(
          userId,
          tenantId,
        );

      const employeeJobInfo = response.employeeJobInformation[0];
      const averageOKrrule =
        await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(
          tenantId,
        );

      const {
        totalOkr,
        completedOkr,
        daysLeft,
        keyResultCount,
        teamOkr,
        companyOkr,
      } = await this.calculateUserOKR(
        userId,
        tenantId,
        employeeJobInfo,
        averageOKrrule,
        paginationOptions,
      );
      return teamOkr;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getOkrOfCompany(
    userId: string,
    tenantId: string,
    paginationOptions?: PaginationDto,
  ): Promise<number> {
    try {
      const response =
        await this.getFromOrganizatiAndEmployeInfoService.getUsers(
          userId,
          tenantId,
        );

      const employeeJobInfo = response.employeeJobInformation[0];
      const averageOKrrule =
        await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(
          tenantId,
        );

      const {
        totalOkr,
        completedOkr,
        daysLeft,
        keyResultCount,
        teamOkr,
        companyOkr,
      } = await this.calculateUserOKR(
        userId,
        tenantId,
        employeeJobInfo,
        averageOKrrule,
        paginationOptions,
      );
      return companyOkr;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
