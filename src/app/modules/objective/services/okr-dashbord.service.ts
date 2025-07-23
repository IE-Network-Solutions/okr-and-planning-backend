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
        this.getFromOrganizatiAndEmployeInfoService.getDepartmentsWithUsers(tenantId),
      ]);

      const employeeJobInfo = userResponse.employeeJobInformation[0];
      const isTeamLead = employeeJobInfo.departmentLeadOrNot;

      if (isTeamLead) {
        // Get team members' detailed OKR data including the team lead
        const teamMembersData = await this.getTeamMembersDetailedOkrData(
          employeeJobInfo.departmentId,
          tenantId,
          departments,
          paginationOptions,
        );

        
        return teamMembersData;
      } else {
        // For regular members, return their own objectives in the requested format
        const userObjectives = await this.getUserDetailedObjectives(userId, tenantId);
        
        return this.paginationServise.paginateArray(userObjectives, {
          page: paginationOptions?.page,
          limit: paginationOptions?.limit,
        });
      }
    } catch (error) {
      return this.paginationServise.paginateArray([], {
        page: paginationOptions?.page,
        limit: paginationOptions?.limit,
      });
    }
  }

  /**
   * Optimized method to get user OKR using QueryBuilder with single query
   */
  private async getUserOkrWithQueryBuilder(userId: string, tenantId: string) {
    try {
      const activeSession = await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(tenantId);
      
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
          'keyResults.initialValue'
        ])
        .where('objective.userId = :userId', { userId })
        .andWhere('objective.tenantId = :tenantId', { tenantId });

      if (activeSession) {
        queryBuilder.andWhere('objective.sessionId = :sessionId', { sessionId: activeSession.id });
      }

      const objectives = await queryBuilder.getMany();
      
      if (!objectives || objectives.length === 0) {
        return { 
          okr: 0, 
          daysLeft: 0, 
          okrCompleted: 0, 
          keyResultcount: 0,
          objectives: []
        };
      }

      // Calculate OKR metrics in memory (much faster than multiple DB calls)
      let totalProgress = 0;
      let completedKeyResults = 0;
      let totalKeyResults = 0;
      let maxDaysLeft = 0;

      objectives.forEach(objective => {
        const daysLeft = Math.ceil(
          (new Date(objective.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        maxDaysLeft = Math.max(maxDaysLeft, daysLeft);

        let objectiveProgress = 0;
        objective.keyResults.forEach(keyResult => {
          objectiveProgress += (keyResult.progress * keyResult.weight) / 100;
          totalKeyResults++;
          if (parseFloat(keyResult.progress.toString()) === 100) {
            completedKeyResults++;
          }
        });
        totalProgress += objectiveProgress;
      });

      const averageOkr = objectives.length > 0 ? totalProgress / objectives.length : 0;

      return {
        okr: averageOkr,
        daysLeft: maxDaysLeft,
        okrCompleted: completedKeyResults,
        keyResultcount: totalKeyResults,
        objectives: objectives
      };
    } catch (error) {
      // console.warn(`[WARNING] Failed to get user OKR for ${userId}:`, error.message);
      return { 
        okr: 0, 
        daysLeft: 0, 
        okrCompleted: 0, 
        keyResultcount: 0,
        objectives: []
      };
    }
  }

  /**
   * Get detailed objectives for a single user with all relationships
   */
  private async getUserDetailedObjectives(userId: string, tenantId: string) {
    try {
      const activeSession = await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(tenantId);
      
      const queryBuilder = this.objectiveRepository
        .createQueryBuilder('objective')
        .leftJoinAndSelect('objective.keyResults', 'keyResults')
        .leftJoinAndSelect('keyResults.milestones', 'milestones')
        .leftJoinAndSelect('keyResults.metricType', 'metricType')
        .where('objective.userId = :userId', { userId })
        .andWhere('objective.tenantId = :tenantId', { tenantId });

      if (activeSession) {
        queryBuilder.andWhere('objective.sessionId = :sessionId', { sessionId: activeSession.id });
      }

      const objectives = await queryBuilder.getMany();
      
      // Get user data separately
      const userData = await this.getFromOrganizatiAndEmployeInfoService.getUsers(userId, tenantId);
      
      return objectives.map(objective => {
        // Calculate days left
        const daysLeft = Math.ceil(
          (new Date(objective.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        // Calculate objective progress and completed key results
        let objectiveProgress = 0;
        let completedKeyResults = 0;
        
        objective.keyResults.forEach(keyResult => {
          objectiveProgress += (keyResult.progress * keyResult.weight) / 100;
          if (parseFloat(keyResult.progress.toString()) === 100) {
            completedKeyResults++;
          }
        });

        return {
          ...objective,
          user: userData,
          daysLeft,
          objectiveProgress,
          completedKeyResults
        };
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Get detailed team members OKR data with all relationships
   */
  private async getTeamMembersDetailedOkrData(
    departmentId: string,
    tenantId: string,
    departments: any[],
    paginationOptions?: PaginationDto,
  ) {
    try {
      const department = departments.find(item => item.id === departmentId);
      if (!department) {
        return this.paginationServise.paginateArray([], {
          page: paginationOptions?.page,
          limit: paginationOptions?.limit,
        });
      }

      // Get all direct team members (non-leads) from the department
      const directTeamMembers = department.users.filter(
        user => !user.employeeJobInformation[0]?.departmentLeadOrNot,
      );

      // Get the team lead
      const teamLead = department.users.find(
        user => user.employeeJobInformation[0]?.departmentLeadOrNot,
      );

      // Get detailed objectives for all team members including the team lead
      const allTeamObjectives = [];
      
      // Add team lead's objectives first
      if (teamLead) {
        const teamLeadObjectives = await this.getUserDetailedObjectives(teamLead.id, tenantId);
        allTeamObjectives.push(...teamLeadObjectives);
      }

      // Add other team members' objectives from the current department
      for (const member of directTeamMembers) {
        const memberObjectives = await this.getUserDetailedObjectives(member.id, tenantId);
        allTeamObjectives.push(...memberObjectives);
      }

      // Get all subordinates from child departments recursively
      const childDepartmentsSubordinates = await this.getAllSubordinatesFromChildDepartments(
        departmentId,
        tenantId,
        departments,
      );
      allTeamObjectives.push(...childDepartmentsSubordinates);

      return this.paginationServise.paginateArray(allTeamObjectives, {
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
   * Recursively get all subordinates from child departments
   */
  private async getAllSubordinatesFromChildDepartments(
    departmentId: string,
    tenantId: string,
    departments: any[],
  ): Promise<any[]> {
    try {
      const allSubordinatesObjectives = [];

      // Get child departments
      const childDepartments = await this.getFromOrganizatiAndEmployeInfoService
        .childDepartmentWithUsers(tenantId, departmentId);

      for (const childDepartment of childDepartments) {
        // Get all users from this child department
        const childDepartmentUsers = childDepartment.users || [];
        
        for (const user of childDepartmentUsers) {
          // Get objectives for each user in the child department
          const userObjectives = await this.getUserDetailedObjectives(user.id, tenantId);
          allSubordinatesObjectives.push(...userObjectives);
        }

        // Recursively get subordinates from deeper child departments
        const deeperSubordinates = await this.getAllSubordinatesFromChildDepartments(
          childDepartment.id,
          tenantId,
          departments,
        );
        allSubordinatesObjectives.push(...deeperSubordinates);
      }

      return allSubordinatesObjectives;
    } catch (error) {
      return [];
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
