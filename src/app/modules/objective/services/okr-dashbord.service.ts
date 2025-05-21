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
import { OKRCalculationService } from './okr-calculation.service';

@Injectable()
export class OKRDashboardService {
  constructor(
    private readonly averageOkrCalculation: AverageOkrCalculation,
    private readonly getFromOrganizatiAndEmployeInfoService: GetFromOrganizatiAndEmployeInfoService,
    private readonly averageOkrRuleService: AverageOkrRuleService,
    private readonly objectiveService: ObjectiveService,
    private readonly oKRCalculationService: OKRCalculationService,
  ) {}
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
      const averageOKRRule =
        await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(
          tenantId,
        );
      const departments =
        await this.getFromOrganizatiAndEmployeInfoService.getDepartmentsWithUsers(
          tenantId,
        );

      const supervisorInfo = response.reportingTo.employeeJobInformation[0];

      const supervisorId = response?.reportingTo?.id;
      const totalSupervisorOkr = await this.oKRCalculationService.supervisorOkr(
        supervisorId,
        supervisorInfo,
        tenantId,
        departments,
        averageOKRRule,
      );

      return totalSupervisorOkr || 0;
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
      const departments =
        await this.getFromOrganizatiAndEmployeInfoService.getDepartmentsWithUsers(
          tenantId,
        );
      const employeeJobInfo = response.employeeJobInformation[0];
  const teamOk = await this.oKRCalculationService.calculateRecursiveOKR(
        employeeJobInfo.departmentId,
        tenantId,
        departments,
      );
      return teamOk || 0;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async okrOfTheCompany(tenantId: string, paginationOptions?: PaginationDto) {
    const departments =
      await this.getFromOrganizatiAndEmployeInfoService.getDepartmentsWithUsers(
        tenantId,
      );
    const averageOKRRule =
      await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(tenantId);

    const companyOkr = await this.oKRCalculationService.companyOkr(
      tenantId,
      departments,
      averageOKRRule,
      paginationOptions,
    );
    return companyOkr || 0;
  }
}
