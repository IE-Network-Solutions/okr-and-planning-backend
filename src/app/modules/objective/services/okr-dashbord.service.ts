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
    private readonly paginationServise: PaginationService,
    @InjectRepository(Objective)
    private readonly objectiveRepository: Repository<Objective>,
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
  ) {
    try {
      // Parallel execution of all required data fetching
      const [userResponse, averageOKRRule, departments] = await Promise.all([
        this.getFromOrganizatiAndEmployeInfoService.getUsers(userId, tenantId),
        this.averageOkrRuleService.findOneAverageOkrRuleByTenant(tenantId),
        this.getFromOrganizatiAndEmployeInfoService.getDepartmentsWithUsers(
          tenantId,
        ),
      ]);

      const employeeJobInfo = userResponse.employeeJobInformation[0];
      const isTeamLead = employeeJobInfo.departmentLeadOrNot;

      // Get user's own OKR using optimized QueryBuilder
      const userOkr = await this.getUserOkrWithQueryBuilder(userId, tenantId);

      if (isTeamLead) {
        // Team Lead Response Structure
        const teamOkr = await this.oKRCalculationService.calculateRecursiveOKR(
          employeeJobInfo.departmentId,
          tenantId,
          departments,
        );
        const totalLeadOkr =
          (userOkr.okr * (averageOKRRule?.myOkrPercentage ?? 20)) / 100 +
          (teamOkr * (averageOKRRule?.teamOkrPercentage ?? 80)) / 100;

        // Get team members' OKRs using optimized QueryBuilder
        const teamMembersPaginated = await this.getTeamMembersOkrDataOptimized(
          employeeJobInfo.departmentId,
          tenantId,
          departments,
          paginationOptions,
        );

        // Add team lead's own details
        const teamLeadDetails = {
          userId,
          userName: userResponse.name || userResponse.email,
          departmentId: employeeJobInfo.departmentId,
          departmentName:
            departments.find((dept) => dept.id === employeeJobInfo.departmentId)
              ?.name || null,
          isDirectTeamMember: false,
          isTeamLead: true,
          okrScore: userOkr.okr || 0,
          daysLeft:
            userOkr.daysLeft && isFinite(userOkr.daysLeft)
              ? userOkr.daysLeft
              : null,
          okrCompleted: userOkr.okrCompleted || 0,
          keyResultCount: userOkr.keyResultcount || 0,
          objectives: userOkr.objectives || [],
        };

        return {
          userOkr: totalLeadOkr,
          teamLead: teamLeadDetails,
          teamMembers: teamMembersPaginated.items,
        };
      } else {
        // Regular Member Response Structure - simpler format
        return {
          userOkr: userOkr.okr || 0,
          userId,
          userName: userResponse.name || userResponse.email,
          departmentId: employeeJobInfo.departmentId,
          departmentName:
            departments.find((dept) => dept.id === employeeJobInfo.departmentId)
              ?.name || null,
          isDirectTeamMember: false,
          isTeamLead: false,
          okrScore: userOkr.okr || 0,
          daysLeft:
            userOkr.daysLeft && isFinite(userOkr.daysLeft)
              ? userOkr.daysLeft
              : null,
          okrCompleted: userOkr.okrCompleted || 0,
          keyResultCount: userOkr.keyResultcount || 0,
          objectives: userOkr.objectives || [],
        };
      }
    } catch (error) {
      return {
        userOkr: 0,
        teamMembers: [],
      };
    }
  }

  /**
   * Optimized method to get user OKR using QueryBuilder with single query
   */
  private async getUserOkrWithQueryBuilder(userId: string, tenantId: string) {
    try {
      const activeSession =
        await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
          tenantId,
        );

      const queryBuilder = this.objectiveRepository
        .createQueryBuilder('objective')
        .leftJoin('objective.keyResults', 'keyResults')
        .addSelect([
          'objective.id',
          'objective.userId',
          'objective.title',
          'objective.description',
          'objective.deadline',
          'objective.isClosed',
          'keyResults.id',
          'keyResults.title',
          'keyResults.description',
          'keyResults.progress',
          'keyResults.weight',
          'keyResults.currentValue',
          'keyResults.targetValue',
          'keyResults.initialValue',
        ])
        .where('objective.userId = :userId', { userId })
        .andWhere('objective.tenantId = :tenantId', { tenantId });

      if (activeSession) {
        queryBuilder.andWhere('objective.sessionId = :sessionId', {
          sessionId: activeSession.id,
        });
      }

      const objectives = await queryBuilder.getMany();

      if (!objectives || objectives.length === 0) {
        return {
          okr: 0,
          daysLeft: 0,
          okrCompleted: 0,
          keyResultcount: 0,
          objectives: [],
        };
      }

      // Calculate OKR metrics in memory (much faster than multiple DB calls)
      let totalProgress = 0;
      let completedKeyResults = 0;
      let totalKeyResults = 0;
      let maxDaysLeft = 0;

      objectives.forEach((objective) => {
        const daysLeft = Math.ceil(
          (new Date(objective.deadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        );
        maxDaysLeft = Math.max(maxDaysLeft, daysLeft);

        let objectiveProgress = 0;
        objective.keyResults.forEach((keyResult) => {
          objectiveProgress += (keyResult.progress * keyResult.weight) / 100;
          totalKeyResults++;
          if (parseFloat(keyResult.progress.toString()) === 100) {
            completedKeyResults++;
          }
        });
        totalProgress += objectiveProgress;
      });

      const averageOkr =
        objectives.length > 0 ? totalProgress / objectives.length : 0;

      return {
        okr: averageOkr,
        daysLeft: maxDaysLeft,
        okrCompleted: completedKeyResults,
        keyResultcount: totalKeyResults,
        objectives: objectives,
      };
    } catch (error) {
      // console.warn(`[WARNING] Failed to get user OKR for ${userId}:`, error.message);
      return {
        okr: 0,
        daysLeft: 0,
        okrCompleted: 0,
        keyResultcount: 0,
        objectives: [],
      };
    }
  }

  /**
   * Get team members OKR data for a team - highly optimized with QueryBuilder
   */
  private async getTeamMembersOkrDataOptimized(
    departmentId: string,
    tenantId: string,
    departments: any[],
    paginationOptions?: PaginationDto,
  ) {
    try {
      const department = departments.find((item) => item.id === departmentId);
      if (!department) {
        return this.paginationServise.paginateArray([], {
          page: paginationOptions?.page,
          limit: paginationOptions?.limit,
        });
      }

      // Get all direct team members (non-leads) from the department
      const directTeamMembers = department.users.filter(
        (user) => !user.employeeJobInformation[0]?.departmentLeadOrNot,
      );

      if (!directTeamMembers.length) {
        return this.paginationServise.paginateArray([], {
          page: paginationOptions?.page,
          limit: paginationOptions?.limit,
        });
      }

      // Get all OKR data for all team members in a single optimized query
      const teamMembersOkrData = await this.getBulkUsersOkrWithQueryBuilder(
        directTeamMembers.map((user) => user.id),
        tenantId,
      );

      // Map the results to the expected format
      const results = directTeamMembers.map((member) => {
        const memberOkr = teamMembersOkrData[member.id] || {
          okr: 0,
          daysLeft: 0,
          okrCompleted: 0,
          keyResultcount: 0,
          objectives: [],
        };

        return {
          userId: member.id,
          userName: member.name || member.email,
          departmentId,
          departmentName: department.name,
          isDirectTeamMember: true,
          isTeamLead: false,
          okrScore: memberOkr.okr || 0,
          daysLeft:
            memberOkr.daysLeft && isFinite(memberOkr.daysLeft)
              ? memberOkr.daysLeft
              : null,
          okrCompleted: memberOkr.okrCompleted || 0,
          keyResultCount: memberOkr.keyResultcount || 0,
          objectives: memberOkr.objectives || [],
        };
      });

      return this.paginationServise.paginateArray(results, {
        page: paginationOptions?.page,
        limit: paginationOptions?.limit,
      });
    } catch (error) {
      return this.paginationServise.paginateArray([], {
        page: paginationOptions?.page,
        limit: paginationOptions?.limit,
      });
    }
  }

  /**
   * Optimized method to get OKR data for multiple users in a single query
   */
  private async getBulkUsersOkrWithQueryBuilder(
    userIds: string[],
    tenantId: string,
  ) {
    try {
      const activeSession =
        await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
          tenantId,
        );

      const queryBuilder = this.objectiveRepository
        .createQueryBuilder('objective')
        .leftJoin('objective.keyResults', 'keyResults')
        .addSelect([
          'objective.id',
          'objective.userId',
          'objective.title',
          'objective.description',
          'objective.deadline',
          'objective.isClosed',
          'keyResults.id',
          'keyResults.title',
          'keyResults.description',
          'keyResults.progress',
          'keyResults.weight',
          'keyResults.currentValue',
          'keyResults.targetValue',
          'keyResults.initialValue',
        ])
        .where('objective.userId IN (:...userIds)', { userIds })
        .andWhere('objective.tenantId = :tenantId', { tenantId });

      if (activeSession) {
        queryBuilder.andWhere('objective.sessionId = :sessionId', {
          sessionId: activeSession.id,
        });
      }

      const objectives = await queryBuilder.getMany();

      // Group objectives by user ID and calculate OKR for each user
      const objectivesByUser = {};
      objectives.forEach((objective) => {
        if (!objectivesByUser[objective.userId]) {
          objectivesByUser[objective.userId] = [];
        }
        objectivesByUser[objective.userId].push(objective);
      });

      const results = {};

      // Calculate OKR for each user
      Object.keys(objectivesByUser).forEach((userId) => {
        const userObjectives = objectivesByUser[userId];
        let totalProgress = 0;
        let completedKeyResults = 0;
        let totalKeyResults = 0;
        let maxDaysLeft = 0;

        userObjectives.forEach((objective) => {
          const daysLeft = Math.ceil(
            (new Date(objective.deadline).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          );
          maxDaysLeft = Math.max(maxDaysLeft, daysLeft);

          let objectiveProgress = 0;
          objective.keyResults.forEach((keyResult) => {
            objectiveProgress += (keyResult.progress * keyResult.weight) / 100;
            totalKeyResults++;
            if (parseFloat(keyResult.progress.toString()) === 100) {
              completedKeyResults++;
            }
          });
          totalProgress += objectiveProgress;
        });

        const averageOkr =
          userObjectives.length > 0 ? totalProgress / userObjectives.length : 0;

        results[userId] = {
          okr: averageOkr,
          daysLeft: maxDaysLeft,
          okrCompleted: completedKeyResults,
          keyResultcount: totalKeyResults,
          objectives: userObjectives,
        };
      });

      return results;
    } catch (error) {
      return {};
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
