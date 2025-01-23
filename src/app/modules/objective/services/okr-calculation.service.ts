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
//     async handleUserOkr(
//       userId: string,
//       tenantId: string,
//       paginationOptions?: PaginationDto,
//     ): Promise<ViewUserAndSupervisorOKRDto> {
//       try {
//         const options: IPaginationOptions = {
//           page: paginationOptions.page,
//           limit: paginationOptions.limit,
//         };
//         const response =
//           await this.getFromOrganizatiAndEmployeInfoService.getUsers(
//             userId,
//             tenantId,
//           );
//         const employeeJobInfo = response.employeeJobInformation[0];
//         if(employeeJobInfo.departmentLeadOrNot){
//       const userOkr= await  this.calculateLeadsOKr(employeeJobInfo,tenantId)

//         }else{
//             await  this.objectiveService.findAllObjectives(
//                 userId,
//                 tenantId,
//                 null,
//                 paginationOptions,
//               ),
//               const individualOKRScore =
//               await this.averageOkrCalculation.calculateAverageOkr(
//                 individualObjectives.items,
//               );
//         }
//         if(response.reportingTo){
//             const response =
//             await this.getFromOrganizatiAndEmployeInfoService.getUsers(
//               userId,
//               tenantId,
//             );
//             const employeeJobInfo = response.employeeJobInformation[0];
//            await this.calculateLeadsOKr(employeeJobInfo,tenantId)
//         }

  
//       } 
 
//       totalOkr = individualOKRScore.okr;
//         daysLeft = individualOKRScore.daysLeft;
//         completedOkr = individualOKRScore.okrCompleted;
//         keyResultCount = individualOKRScore.keyResultcount;
      
//       catch (error) {
//         throw new BadRequestException(error.message);
//       }
//     }


  

//    async  calculateLeadsOKr( employeeJobInfo: JobInformationDto,
//         tenantId: string,
//        ){
    
    
//           //const employeeJobInfo = response.employeeJobInformation[0];
         
//               const departments =
//               await this.getFromOrganizatiAndEmployeInfoService.getDepartmentsWithUsers(
//                 tenantId,
//               );
      
//             const department = departments.find(
//               (item) => item.id === employeeJobInfo.departmentId,
//             );
//             const users = department.users.filter((user)=>user.id!==userId)
//             if(users){
//              const individualObjectives = this.objectiveService.findUsersObjectives(tenantId, users)
//               const individualOKRScore =
//               await this.averageOkrCalculation.calculateAverageOkr(
//                 individualObjectives.items,
//               );
            
      
//             }
//             else{
//               const childDepartments =
//               await this.getFromOrganizatiAndEmployeInfoService.getDepartmentsWithUsers(
//                 tenantId,
//               );
//               const departmentData = departments.find(
//                   (item) => item.id === childDepartments.map((item)=>item.id)
//                 );
      
//                for(const departmentUsers of departmentData){
//                   //departmentUsers should be array of users string
//                const   teamObjectives= await   this.objectiveService.findUsersObjectives(tenantId, departmentUsers)
  
  
  
//                }
             
//                leadsOkr +=
//                (individualOKRScore.okr * (averageOKrrule?.myOkrPercentage ?? 20)) /
//                100;
//              daysLeft = individualOKRScore.daysLeft;
//              completedOkr = individualOKRScore.okrCompleted;
     
//              if (teamObjectives) {
//                const teamOKRScore =
//                  await this.averageOkrCalculation.calculateAverageOkr(
//                    teamObjectives,
//                  );
//                teamOkr = teamOKRScore.okr;
//                leadsOkr +=
//                  (teamOKRScore.okr * (averageOKrrule?.teamOkrPercentage ?? 80)) /
//                  100;
               
//             }
  
//           }
  
    
        

//         }

async handleUserOkr(
    userId: string,
    tenantId: string,
    paginationOptions?: PaginationDto
  ): Promise<ViewUserAndSupervisorOKRDto> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions?.page || 1,
        limit: paginationOptions?.limit || 10,
      };
  
      const response = await this.getFromOrganizatiAndEmployeInfoService.getUsers(
        userId,
        tenantId
      );
  
      if (!response || !response.employeeJobInformation.length) {
        throw new BadRequestException('Invalid user data or no job information found.');
      }
  
      const employeeJobInfo = response.employeeJobInformation[0];
      let totalOkr = 0;
      let daysLeft = 0;
      let completedOkr = 0;
      let keyResultCount = 0;
  
      if (employeeJobInfo.departmentLeadOrNot) {
        const leadOKR = await this.calculateLeadsOKr(employeeJobInfo, tenantId);
        totalOkr = leadOKR.totalOkr;
        daysLeft = leadOKR.daysLeft;
        completedOkr = leadOKR.completedOkr;
        keyResultCount = leadOKR.keyResultCount;
      } else {
        const individualObjectives = await this.objectiveService.findAllObjectives(
          userId,
          tenantId,
          null,
          paginationOptions
        );
  
        const individualOKRScore = await this.averageOkrCalculation.calculateAverageOkr(
          individualObjectives.items
        );
  
        totalOkr = individualOKRScore.okr;
        daysLeft = individualOKRScore.daysLeft;
        completedOkr = individualOKRScore.okrCompleted;
        keyResultCount = individualOKRScore.keyResultcount;
      }
  
      if (response.reportingTo) {
        const reportingResponse = await this.getFromOrganizatiAndEmployeInfoService.getUsers(
          response.reportingTo,
          tenantId
        );
  
        if (
          reportingResponse &&
          reportingResponse.employeeJobInformation &&
          reportingResponse.employeeJobInformation.length
        ) {
          const reportingEmployeeJobInfo = reportingResponse.employeeJobInformation[0];
         const supervisorOkr= await this.calculateLeadsOKr(reportingEmployeeJobInfo, tenantId);
        }
      }

      return {
        userOkr:totalOkr,
        daysLeft,
        okrCompleted:completedOkr,
        keyResultCount,
        teamOkr:0,
        companyOkr:0
        supervisorOkr:supervisorOkr,

      };
    } catch (error) {
      throw new BadRequestException(`Error handling user OKR: ${error.message}`);
    }
  }
  
  
  async calculateLeadsOKr(
    employeeJobInfo: JobInformationDto,
    tenantId: string
  ): Promise<{ totalOkr: number; daysLeft: number; completedOkr: number; keyResultCount: number }> {
    try {
      const departments = await this.getFromOrganizatiAndEmployeInfoService.getDepartmentsWithUsers(
        tenantId
      );
  
      if (!departments || departments.length === 0) {
        throw new BadRequestException('No departments found for the tenant.');
      }
  
      const averageOKRRule =
        await this.averageOkrRuleService.findOneAverageOkrRuleByTenant(tenantId);
  
      const department = departments.find(
        (item) => item.id === employeeJobInfo.departmentId
      );
  
      const individualObjectives = await this.objectiveService.findAllObjectives(
        employeeJobInfo.userId,
        tenantId,
        null
      );
  
      const individualOKRScore = await this.averageOkrCalculation.calculateAverageOkr(
        individualObjectives.items
      );
  
      let totalOkr = 0;
      let daysLeft = individualOKRScore.daysLeft;
      let completedOkr = individualOKRScore.okrCompleted;
      let keyResultCount = 0;
  
      if (department) {
        const users = department.users.filter(
          (user) => user.id !== employeeJobInfo.userId
        );
  
        let teamOKRScore = { okr: 0, daysLeft: 0, okrCompleted: 0 };
  
        if (users.length === 0) {
          const childDepartments = await this.getFromOrganizatiAndEmployeInfoService.chileddepartmentwithusers(
            employeeJobInfo.departmentId,
            tenantId
          );
  
          const allChildObjectives = [];
  
          for (const childDepartment of childDepartments) {
            const childObjectives = await this.objectiveService.findUsersObjectives(
              tenantId,
              childDepartment.users
            );
            allChildObjectives.push(...childObjectives.items);
          }
  
          teamOKRScore = await this.averageOkrCalculation.calculateAverageOkr(
            allChildObjectives
          );
        } else {
          const teamObjectives = await this.objectiveService.findUsersObjectives(
            tenantId,
            users
          );
  
          teamOKRScore = await this.averageOkrCalculation.calculateAverageOkr(
            teamObjectives.items
          );
        }
  
        totalOkr =
          (individualOKRScore.okr * (averageOKRRule?.myOkrPercentage ?? 20)) / 100;
  
        totalOkr +=
          (teamOKRScore.okr * (averageOKRRule?.teamOkrPercentage ?? 80)) / 100;
      }
  
      return {
        totalOkr,
        daysLeft,
        completedOkr,
        keyResultCount,
      };
    } catch (error) {
      throw new BadRequestException(`Error calculating lead's OKR: ${error.message}`);
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
  