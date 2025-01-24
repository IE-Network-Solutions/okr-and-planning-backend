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
  export class OKRCalculationService {
    constructor(
      private readonly averageOkrCalculation: AverageOkrCalculation,
      private readonly getFromOrganizatiAndEmployeInfoService: GetFromOrganizatiAndEmployeInfoService,
      private readonly averageOkrRuleService: AverageOkrRuleService,
      private readonly objectiveService: ObjectiveService,
    ) {}
  
    async handleUserOkr(
      userId: string,
      tenantId: string,
      paginationOptions?: PaginationDto
    ) {
      try {
        const userResponse = await this.getFromOrganizatiAndEmployeInfoService.getUsers(userId, tenantId);
        const averageOKRRule = await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(tenantId);

        if (!userResponse || !userResponse.employeeJobInformation.length) {
          throw new BadRequestException('Invalid user data or no job information found.');
        }
  
        const employeeJobInfo = userResponse.employeeJobInformation[0];
        const result = {
          userOkr: 0,
          daysLeft: 0,
          okrCompleted: 0,
          keyResultCount: 0,
          supervisorOkr: 0,
        };
  
        if (employeeJobInfo.departmentLeadOrNot) {
          const objectives = await this.objectiveService.findAllObjectives(userId, tenantId, null);
          const leadOKR = await this.averageOkrCalculation.calculateAverageOkr(objectives.items);
          const teamOkr = await this.calculateRecursiveOKR(employeeJobInfo.departmentId, tenantId);
const totalLeadOkr=(leadOKR.okr * (averageOKRRule?.myOkrPercentage ?? 20)) / 100 + (teamOkr * (averageOKRRule?.teamOkrPercentage ?? 80)) / 100
          Object.assign(result, {
            userOkr: totalLeadOkr,
            daysLeft: leadOKR.daysLeft,
            okrCompleted: leadOKR.okrCompleted,
            keyResultCount: leadOKR.keyResultcount,
          });
        } else {
          const objectives = await this.objectiveService.findAllObjectives(userId, tenantId, null);
          const individualOKR = await this.averageOkrCalculation.calculateAverageOkr(objectives.items);
          Object.assign(result, {
            userOkr: individualOKR.okr,
            daysLeft: individualOKR.daysLeft,
            okrCompleted: individualOKR.okrCompleted,
            keyResultCount: individualOKR.keyResultcount,
          });
        }
  
        if (userResponse.reportingTo?.employeeJobInformation?.length) {

          const supervisorInfo = userResponse.reportingTo.employeeJobInformation[0];
          const supervisorUserId =userResponse.reportingTo?.id
          const supervisorObjectives = await this.objectiveService.findAllObjectives(supervisorUserId, tenantId, null);
          const supervisorOKR = await this.averageOkrCalculation.calculateAverageOkr(supervisorObjectives.items);
          const supervisorTeamOkr = await this.calculateRecursiveOKR(supervisorInfo.departmentId, tenantId);
const totalSupervisorOkr=(supervisorOKR.okr * (averageOKRRule?.myOkrPercentage ?? 20)) / 100 + (supervisorTeamOkr * (averageOKRRule?.teamOkrPercentage ?? 80)) / 100    
          result.supervisorOkr = totalSupervisorOkr;
        }


  
        return result;
      } catch (error) {
        throw new BadRequestException(`Error handling user OKR: ${error.message}`);
      }
    }
  
    async calculateRecursiveOKR(
      departmentId: string,
      tenantId: string
    ): Promise<
     number
    > {
      try {
        const departments = await this.getFromOrganizatiAndEmployeInfoService.getDepartmentsWithUsers(tenantId);
  
         const department = departments.find(
        (item) => item.id === departmentId,
      );
  
  
        let totalOkr = 0;
        let numberOfContributor=0
       
        const teamUsers = department.users.filter((user) => !user.employeeJobInformation[0]?.departmentLeadOrNot);
  if(teamUsers.length===0){
    const childDepartments = await this.getFromOrganizatiAndEmployeInfoService.childDepartmentWithUsers(
      tenantId,
      departmentId
    );
    for (const childDepartment of childDepartments) {
      const childOKR = await this.calculateRecursiveOKR(childDepartment.id, tenantId);
    
    }
  }else {
   const userId = teamUsers.map((item)=>item.id)
 const objectiveProgress=  await this.objectiveService.findUsersObjectives(tenantId, userId)
 
    const usersOKR = await this.averageOkrCalculation.calculateAverageOkr(objectiveProgress);
    
     totalOkr += usersOKR.okr
     numberOfContributor =numberOfContributor+1
     


  
  const childDepartments = await this.getFromOrganizatiAndEmployeInfoService.childDepartmentWithUsers(
    tenantId,
    departmentId
  );
  if(childDepartments.length>0){
    for (const childDepartment of childDepartments) {
      const childOKR = await this.calculateRecursiveOKR(childDepartment.id, tenantId);
  
    }


  }
  
}

        return totalOkr/numberOfContributor || 0
      } catch (error) {
        throw new BadRequestException(`Error calculating recursive OKR: ${error.message}`);
      }
    }

    async calculateTeamOkr(  userId: string,
      tenantId: string,
      paginationOptions?: PaginationDto){
        



    }
  }
  
  