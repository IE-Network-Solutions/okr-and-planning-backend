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
import { UpdateObjectiveStatusDto } from '../dto/update-objective-status.dto';
import { FilterObjectiveOfAllEmployeesDto } from '../dto/filter-objective-byemployees.dto';

import { ExportExcelService } from '@root/src/core/export/export-excel.service';
import { FilterVPRecognitionDTo } from '../../variable_pay/dtos/vp-score-instance-dto/filter-vp-recognition.dto';

@Injectable()
export class OKRCalculationService {
  constructor(
    private readonly averageOkrCalculation: AverageOkrCalculation,
    private readonly getFromOrganizatiAndEmployeInfoService: GetFromOrganizatiAndEmployeInfoService,
    private readonly averageOkrRuleService: AverageOkrRuleService,
    private readonly objectiveService: ObjectiveService,
    private readonly paginationServise: PaginationService,
    private readonly excelService: ExportExcelService,
    @InjectRepository(Objective)
    private readonly objectiveRepository: Repository<Objective>,
  ) {}

  async handleUserOkr(
    userId: string,
    tenantId: string,
    paginationOptions?: PaginationDto,
  ) {
    try {
      const userResponse =
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

      if (!userResponse || !userResponse.employeeJobInformation.length) {
        throw new BadRequestException(
          'Invalid user data or no job information found.',
        );
      }

      const employeeJobInfo = userResponse.employeeJobInformation[0];
      const result = {
        userOkr: 0,
        daysLeft: 0,
        okrCompleted: 0,
        keyResultCount: 0,
        supervisorOkr: 0,
        companyOkr: 0,
        teamOkr: 0,
        supervisorKeyResultCount: 0,
        supervisorKeyResultAchieved: 0,
      };
      const userTeamOkr = await this.calculateRecursiveOKR(
        employeeJobInfo.departmentId,
        tenantId,
        departments,
      );

      if (employeeJobInfo.departmentLeadOrNot) {
        const objectives = await this.objectiveService.findAllObjectives(
          userId,
          tenantId,
          null,
        );
        const leadOKR = await this.averageOkrCalculation.calculateAverageOkr(
          objectives.items,
        );
        const totalLeadOkr =
          (leadOKR.okr * (averageOKRRule?.myOkrPercentage ?? 20)) / 100 +
          (userTeamOkr * (averageOKRRule?.teamOkrPercentage ?? 80)) / 100;
        Object.assign(result, {
          userOkr: totalLeadOkr,
          daysLeft: leadOKR.daysLeft,
          okrCompleted: leadOKR.okrCompleted,
          keyResultCount: leadOKR.keyResultcount,
        });
      } else {
        const objectives = await this.objectiveService.findAllObjectives(
          userId,
          tenantId,
          null,
        );
        const individualOKR =
          await this.averageOkrCalculation.calculateAverageOkr(
            objectives.items,
          );
        Object.assign(result, {
          userOkr: individualOKR.okr,
          daysLeft: individualOKR.daysLeft,
          okrCompleted: individualOKR.okrCompleted,
          keyResultCount: individualOKR.keyResultcount,
        });
      }

      if (userResponse.reportingTo?.employeeJobInformation?.length) {
        const supervisorInfo =
          userResponse.reportingTo.employeeJobInformation[0];
        const supervisorUserId = userResponse.reportingTo?.id;
        const totalSupervisorOkr = await this.supervisorOkr(
          supervisorUserId,
          supervisorInfo,
          tenantId,
          departments,
          averageOKRRule,
        );
        result.supervisorOkr = totalSupervisorOkr;
        const objectives = await this.objectiveService.findAllObjectives(
          supervisorUserId,
          tenantId,
          null,
        );
        const supervisorOKR =
          await this.averageOkrCalculation.calculateAverageOkr(
            objectives.items,
          );
        result.supervisorKeyResultCount = supervisorOKR.keyResultcount;
        result.supervisorKeyResultAchieved = supervisorOKR.okrCompleted;
      }

      const companyOkr = await this.companyOkr(
        tenantId,
        departments,
        averageOKRRule,
        paginationOptions,
      );
      result.companyOkr = companyOkr;

      // const teamOkr = await this.calculateTeamOkrOfUser(
      //   userId,
      //   employeeJobInfo.departmentId,
      //   tenantId,
      //   departments,
      //   paginationOptions,
      // );
      result.teamOkr = userTeamOkr;

      return result;
    } catch (error) {
      return {
        userOkr: 0,
        daysLeft: 0,
        okrCompleted: 0,
        keyResultCount: 0,
        supervisorOkr: 0,
        companyOkr: 0,
        teamOkr: 0,
        supervisorKeyResultCount: 0,
        supervisorKeyResultAchieved: 0,
      };
    }
  }

  async exportAllEmployeesOkrProgress(
    res: any,
    tenantId: string,
    filterDto: FilterObjectiveOfAllEmployeesDto,
    paginationOptions?: PaginationDto,
  ) {
    const users =
      await this.getFromOrganizatiAndEmployeInfoService.getAllActiveUsers(
        tenantId,
      );
    const sessions =
      await this.getFromOrganizatiAndEmployeInfoService.getAllSessions(
        tenantId,
      );
    const data = await this.getAllEmployeesOkrProgress(
      tenantId,
      filterDto,
      paginationOptions,
    );
    return await this.excelService.generateExcel(
      res,
      data.items,
      users.items,
      sessions.items,
    );
  }

  async getAllEmployeesOkrProgress(
    tenantId: string,
    filterDto: FilterObjectiveOfAllEmployeesDto,
    paginationOptions?: PaginationDto,
  ) {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions?.page,
        limit: paginationOptions?.limit,
      };
      const [allUsers, okrRule, departments] = await Promise.all([
        this.getFromOrganizatiAndEmployeInfoService.getAllActiveUsers(tenantId),
        this.averageOkrRuleService.findOneAverageOkrRuleByTenant(tenantId),
        this.getFromOrganizatiAndEmployeInfoService.getDepartmentsWithUsers(
          tenantId,
        ),
      ]);

      const allResults = [];

      let usersToProcess = allUsers.items;
      if (filterDto.departmentId) {
        const departmentUsers =
          await this.getFromOrganizatiAndEmployeInfoService.getChildDepartmentsWithUsers(
            filterDto.departmentId,
            tenantId,
          );
        usersToProcess = departmentUsers;
      }
      if (filterDto.userId) {
        usersToProcess = usersToProcess.filter(
          (user) => user.id === filterDto.userId,
        );
        if (usersToProcess.length === 0) {
          return this.paginationServise.paginateArray([], options);
        }
      }

      for (const session of filterDto.sessions) {
        const sessionResults = await Promise.all(
          usersToProcess
            .filter((user) => user.employeeJobInformation?.length > 0)
            .map(async (user) => {
              const jobInfo = user.employeeJobInformation[0];
              const objectives =
                await this.objectiveService.findAllObjectivesBySession(
                  user.id,
                  tenantId,
                  session,
                  null,
                );

              let okrScore: number;

              if (jobInfo.departmentLeadOrNot) {
                const [myOkr, teamOkr] = await Promise.all([
                  this.averageOkrCalculation.calculateAverageOkr(
                    objectives.items,
                  ),

                  this.calculateRecursiveOKRBySession(
                    jobInfo.departmentId,
                    tenantId,
                    session,
                    departments,
                  ),
                ]);

                okrScore =
                  (myOkr.okr * (okrRule?.myOkrPercentage ?? 20)) / 100 +
                  (teamOkr * (okrRule?.teamOkrPercentage ?? 80)) / 100;
              } else {
                const myOkr =
                  await this.averageOkrCalculation.calculateAverageOkr(
                    objectives.items,
                  );
                okrScore = myOkr.okr;
              }

              return { userId: user.id, okrScore, sessionId: session };
            }),
        );

        allResults.push(...sessionResults);
      }

      return this.paginationServise.paginateArray(allResults, options);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getOkrScoreInTimeRange(
    filterVpRecognitionDTo: FilterVPRecognitionDTo,
    tenantId: string,
  ) {
    try {
      const getAllSessions =
        await this.getFromOrganizatiAndEmployeInfoService.getAllSessions(
          tenantId,
        );
      const data = { recipientId: null, totalPoints: 0 };
      const returnedData = [];
      const startDate = new Date(filterVpRecognitionDTo.startDate);
      const endDate = new Date(filterVpRecognitionDTo.endDate);
      const condition = filterVpRecognitionDTo.condition;
      const value = parseFloat(filterVpRecognitionDTo.value.toString());
      const sessionIds = getAllSessions.items
        .filter((item) => {
          const itemStart = new Date(item.startDate);
          const itemEnd = new Date(item.endDate);
          return itemStart >= startDate && itemEnd <= endDate;
        })
        .map((item) => item.id);
      if (sessionIds.length !== 0) {
        const okrProgress = await this.getAllEmployeesOkrProgress(tenantId, {
          sessions: sessionIds,
        });
        for (const okrScore of okrProgress.items) {
          const score = parseFloat(okrScore.okrScore.toString());
          if (eval(`${score} ${condition} ${value}`)) {
            const data = { recipientId: okrScore.userId, totalPoints: score };
            returnedData.push({ ...data });
          }
        }
        return returnedData.sort((a, b) => b.totalPoints - a.totalPoints);
      }

      return returnedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async calculateRecursiveOKR(
    departmentId: string,
    tenantId: string,
    departments: any[],
    totalOkr = { value: 0 },
    numberOfContributor = { value: 0 },
    contributorLevel = 0,
  ): Promise<number> {
    try {
      const department = departments.find((item) => item.id === departmentId);
      if (!department) {
        throw new Error(`Department with ID ${departmentId} not found`);
      }
      const teamUsers = department.users.filter(
        (user) => !user.employeeJobInformation[0]?.departmentLeadOrNot,
      );

      if (teamUsers.length === 0) {
        const childDepartments =
          await this.getFromOrganizatiAndEmployeInfoService.childDepartmentWithUsers(
            tenantId,
            departmentId,
          );

        for (const childDepartment of childDepartments) {
          contributorLevel++;
          await this.calculateRecursiveOKR(
            childDepartment.id,
            tenantId,
            departments,
            totalOkr,
            numberOfContributor,
            contributorLevel,
          );
        }
      } else {
        const userIds = teamUsers.map((user) => user.id);
        const objectiveProgress =
          await this.objectiveService.findUsersObjectives(tenantId, userIds);
        if (objectiveProgress) {
          const usersOKR = await this.averageOkrCalculation.calculateAverageOkr(
            objectiveProgress,
          );
          totalOkr.value += usersOKR.okr;
          numberOfContributor.value++;
        }

        const childDepartments =
          await this.getFromOrganizatiAndEmployeInfoService.childDepartmentWithUsers(
            tenantId,
            departmentId,
          );

        for (const childDepartment of childDepartments) {
          await this.calculateRecursiveOKR(
            childDepartment.id,
            tenantId,
            departments,
            totalOkr,
            numberOfContributor,
            contributorLevel,
          );
        }
      }

      return totalOkr.value / (numberOfContributor.value || 1);
    } catch (error) {
      return 0;
    }
  }
  async calculateRecursiveOKRBySession(
    departmentId: string,
    tenantId: string,
    sessionId: string,
    departments: any[],
    totalOkr = { value: 0 },
    numberOfContributor = { value: 0 },
    contributorLevel = 0,
  ): Promise<number> {
    try {
      const department = departments.find((item) => item.id === departmentId);
      if (!department) {
        throw new Error(`Department with ID ${departmentId} not found`);
      }
      const teamUsers = department.users.filter(
        (user) => !user.employeeJobInformation[0]?.departmentLeadOrNot,
      );

      if (teamUsers.length === 0) {
        const childDepartments =
          await this.getFromOrganizatiAndEmployeInfoService.childDepartmentWithUsers(
            tenantId,
            departmentId,
          );

        for (const childDepartment of childDepartments) {
          contributorLevel++;
          await this.calculateRecursiveOKRBySession(
            childDepartment.id,
            tenantId,
            sessionId,
            departments,
            totalOkr,
            numberOfContributor,
            contributorLevel,
          );
        }
      } else {
        const userIds = teamUsers.map((user) => user.id);
        const objectiveProgress =
          await this.objectiveService.findUsersObjectivesBySession(
            tenantId,
            sessionId,
            userIds,
          );
        if (objectiveProgress) {
          const usersOKR = await this.averageOkrCalculation.calculateAverageOkr(
            objectiveProgress,
          );
          totalOkr.value += usersOKR.okr;
          numberOfContributor.value++;
        }

        const childDepartments =
          await this.getFromOrganizatiAndEmployeInfoService.childDepartmentWithUsers(
            tenantId,
            departmentId,
          );

        for (const childDepartment of childDepartments) {
          await this.calculateRecursiveOKR(
            childDepartment.id,
            tenantId,
            departments,
            totalOkr,
            numberOfContributor,
            contributorLevel,
          );
        }
      }

      return totalOkr.value / (numberOfContributor.value || 1);
    } catch (error) {
      return 0;
    }
  }

  async calculateTeamOkrOfUser(
    userId: string,
    departmentId: string,
    tenantId: string,
    departments: any[],
    paginationOptions?: PaginationDto,
    userCount = 0,
    teamOkr = 0,
  ) {
    try {
      const department = departments.find((item) => item.id === departmentId);
      const users = department.users.filter((item) => item.id !== userId);
      if (users.length > 0) {
        const teamOkrProgress = await this.calculateTeamOkr(
          departmentId,
          tenantId,
          departments,
          paginationOptions,
        );
        teamOkr = teamOkr + teamOkrProgress;
        userCount = userCount + 1;
        const childDepartments =
          await this.getFromOrganizatiAndEmployeInfoService.childDepartmentWithUsers(
            tenantId,
            departmentId,
          );
        for (const childDepartment of childDepartments) {
          const teamOkrProgress = await this.calculateTeamOkr(
            childDepartment.id,
            tenantId,
            departments,
            paginationOptions,
          );
          teamOkr = teamOkr + teamOkrProgress;
          userCount = userCount + 1;
        }
      } else {
        const childDepartments =
          await this.getFromOrganizatiAndEmployeInfoService.childDepartmentWithUsers(
            tenantId,
            departmentId,
          );
        for (const childDepartment of childDepartments) {
          const teamOkrProgress = await this.calculateTeamOkr(
            childDepartment.id,
            tenantId,
            departments,
            paginationOptions,
          );
          teamOkr = teamOkr + teamOkrProgress;
          userCount = userCount + 1;
        }
      }

      return teamOkr / userCount || 0;
    } catch (error) {
      return 0;
    }
  }
  async calculateTeamOkr(
    departmentId: string,
    tenantId: string,
    departments: any[],
    paginationOptions?: PaginationDto,
  ): Promise<number> {
    try {
      let total = 0;
      const department = departments.find((item) => item.id === departmentId);

      if (!department) return 0;

      const userIds = department.users.map((user) => user.id);

      if (userIds.length > 0) {
        const objectiveProgress =
          await this.objectiveService.findUsersObjectives(tenantId, userIds);

        if (objectiveProgress) {
          const teamOkrProgress =
            await this.averageOkrCalculation.calculateAverageOkr(
              objectiveProgress,
            );
          total += teamOkrProgress.okr;
        }
      } else {
        const childDepartments =
          await this.getFromOrganizatiAndEmployeInfoService.childDepartmentWithUsers(
            tenantId,
            departmentId,
          );

        for (const childDepartment of childDepartments) {
          const childTotal = await this.calculateTeamOkr(
            childDepartment.id,
            tenantId,
            departments,
            paginationOptions,
          );
          total += childTotal;
        }
      }

      return total;
    } catch (error) {
      return 0;
    }
  }

  async companyOkr(
    tenantId: string,
    departments: any[],
    averageOKRRule: any,
    paginationOptions?: PaginationDto,
  ): Promise<number> {
    try {
      // Find the root department
      const department = departments.find((item) => item.level === 0);
      if (!department) {
        return 0;
      }

      const teamLead = department.users.find(
        (user) => user.employeeJobInformation[0]?.departmentLeadOrNot,
      );

      let leadOKR = { okr: 0 };

      if (teamLead) {
        const objectives = await this.objectiveService.findAllObjectives(
          teamLead.id,
          tenantId,
          null,
        );

        if (objectives?.items?.length) {
          leadOKR = await this.averageOkrCalculation.calculateAverageOkr(
            objectives.items,
          );
        } else {
        }
      }

      const companyOkrProgress = await this.calculateRecursiveOKR(
        department.id,
        tenantId,
        departments,
      );

      const totalLeadOkr =
        ((leadOKR.okr * (averageOKRRule?.myOkrPercentage ?? 20)) / 100 || 0) +
        ((companyOkrProgress * (averageOKRRule?.teamOkrPercentage ?? 80)) /
          100 || 0);

      return totalLeadOkr || 0;
    } catch (error) {
      return 0;
    }
  }

  async supervisorOkr(
    supervisorUserId: string,
    supervisorInfo: JobInformationDto,
    tenantId: string,
    departments: any[],
    averageOKRRule: any,
  ) {
    try {
      const supervisorObjectives =
        await this.objectiveService.findAllObjectives(
          supervisorUserId,
          tenantId,
          null,
        );
      const supervisorOKR =
        await this.averageOkrCalculation.calculateAverageOkr(
          supervisorObjectives.items,
        );
      const supervisorTeamOkr = await this.calculateRecursiveOKR(
        supervisorInfo.departmentId,
        tenantId,
        departments,
      );
      const totalSupervisorOkr =
        (supervisorOKR.okr * (averageOKRRule?.myOkrPercentage ?? 20)) / 100 +
        (supervisorTeamOkr * (averageOKRRule?.teamOkrPercentage ?? 80)) / 100;
      return totalSupervisorOkr;
    } catch (error) {
      return 0;
    }
  }
  async okrOfUser(
    userId: string,
    tenantId: string,
    paginationOptions?: PaginationDto,
  ) {
    try {
      const userResponse =
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

      const employeeJobInfo = userResponse.employeeJobInformation[0];
      const result = {
        userOkr: 0,
      };

      if (employeeJobInfo.departmentLeadOrNot) {
        const objectives = await this.objectiveService.findAllObjectives(
          userId,
          tenantId,
          null,
        );
        const leadOKR = await this.averageOkrCalculation.calculateAverageOkr(
          objectives.items,
        );
        const teamOkr = await this.calculateRecursiveOKR(
          employeeJobInfo.departmentId,
          tenantId,
          departments,
        );
        const totalLeadOkr =
          (leadOKR.okr * (averageOKRRule?.myOkrPercentage ?? 20)) / 100 +
          (teamOkr * (averageOKRRule?.teamOkrPercentage ?? 80)) / 100;
        Object.assign(result, {
          userOkr: totalLeadOkr,
        });
      } else {
        const objectives = await this.objectiveService.findAllObjectives(
          userId,
          tenantId,
          null,
        );
        const individualOKR =
          await this.averageOkrCalculation.calculateAverageOkr(
            objectives.items,
          );
        Object.assign(result, {
          userOkr: individualOKR.okr,
        });
      }

      return result.userOkr || 0;
    } catch (error) {
      return 0;
    }
  }
}
