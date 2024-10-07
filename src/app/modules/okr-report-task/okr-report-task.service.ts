import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ReportTask } from './entities/okr-report-task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportTaskDTO } from './dto/create-okr-report-task.dto';
import { In, Repository } from 'typeorm';
import { UUID } from 'crypto';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { Plan } from '../plan/entities/plan.entity';
import { OkrReportService } from '../okr-report/okr-report.service';

@Injectable()
export class OkrReportTaskService {

      constructor(
        @InjectRepository(ReportTask)
        private reportTaskRepo: Repository<ReportTask>,
        
        @InjectRepository(PlanningPeriodUser)
        private planningPeriodUserRepository: Repository<PlanningPeriodUser>,

        @InjectRepository(Plan)
        private planRepository: Repository<Plan>,

        @InjectRepository(PlanTask)
        private planTaskRepository: Repository<PlanTask>,

        private reportService: OkrReportService, // Injecting the report service

      ) {}
      async getPlanningPeriodUserId(tenantId: string, userId: string, planningPeriodId: string): Promise<string | null> {
        try {
          // Assuming you have a repository for the PlanningPeriodUser entity
          const planningPeriodUser = await this.planningPeriodUserRepository.findOne({
            where: {
              tenantId: tenantId,
              userId: userId,
              planningPeriodId: planningPeriodId,
            },
          });
      
          return planningPeriodUser ? planningPeriodUser.id : null; // Return the id or null if not found
        } catch (error) {
          throw new Error(`Error fetching planning period user ID: ${error.message}`);
        }
      }
      async getPlanId(planningPeriodUserId: string): Promise<string | null> {
        try {
          // Assuming you have a repository for the PlanningPeriodUser entity
          const plan = await this.planRepository.findOne({
            where: {
              planningUserId: planningPeriodUserId,
            },
          });
      
          return plan ? plan.id : null; // Return the id or null if not found
        } catch (error) {
          throw new Error(`Error fetching planning period user ID: ${error.message}`);
        }
      }
      async create(
        createReportDto: ReportTaskDTO, 
        tenantId: string,
        planningPeriodId:string,
        userId:string,
      ): Promise<any> {
      const planningPeriodUser= await this.getPlanningPeriodUserId( tenantId, planningPeriodId,userId);
      if (!planningPeriodUser) {
        throw new Error('Planning period user not found');
      }
      
      const planId=await this.getPlanId( planningPeriodUser);
      if (!planId) {
        throw new Error('Plan not found for the given planning period user');
      }
      const reportData = {
        reportScore: '70%', // Adjust as necessary
        reportTitle: new Date().toISOString(), // Set to current date in ISO format
        planId: planId,
        userId:userId,
        tenantId:tenantId
        // Add any other necessary fields from createReportDto
      };

      return await this.reportService.createReportWithTasks(reportData);


      }
      
      async getUnReportedPlanTasks(userId: string, planningPeriodId: string, tenantId: string): Promise<any> {
        try {
          // Fetch all plan tasks where reports have not been created yet
          const unreportedTasks = await this.planTaskRepository
          .createQueryBuilder('planTask')
          .leftJoinAndSelect('planTask.plan', 'plan')
          .leftJoinAndSelect('planTask.milestone', 'milestone')
          .leftJoinAndSelect('planTask.keyResult', 'keyResult')
          .leftJoinAndSelect('keyResult.objective', 'objective') // Add join with objective
          .leftJoinAndSelect('planTask.parentTask', 'parentTask')
          .leftJoinAndSelect('plan.planningUser', 'planningUser') // Add relation to planningUser from the Plan entity
        
          // Fetch unreported plan tasks based on userId, tenantId, and planningPeriodId
          .where('plan.isReported = :isReported', { isReported: false })
          .andWhere('plan.tenantId = :tenantId', { tenantId })
          .andWhere('plan.userId = :userId', { userId }) 
          .andWhere('planningUser.planningPeriodId = :planningPeriodId', { planningPeriodId }) 
          .getMany();
        
        return unreportedTasks;
        
        } catch (error) {
          throw new ConflictException(`Error fetching unreported tasks: ${error.message}`);
        }
      }

      async findAllReportTasks(
        tenantId: UUID,
        userIds: string[],
        planningPeriodId: string
      ) {
        try {
          // Fetch all report tasks that match the given tenantId, userIds, and planningPeriodId
          const reportTasks = await this.reportTaskRepo
          .createQueryBuilder('reportTask') // Start from reportTask
          .leftJoinAndSelect('reportTask.planTask', 'planTask') // Join planTask
          .leftJoinAndSelect('planTask.plan', 'plan') // Join plan
          .leftJoinAndSelect('plan.planningUser', 'planningUser') // Join planningUser
          .leftJoinAndSelect('planTask.keyResult', 'keyResult') // Join KeyResult for details
          .leftJoinAndSelect('planTask.milestone', 'milestone') // Join milestone
          .where('reportTask.tenantId = :tenantId', { tenantId }) // Filter by tenantId
          // Conditionally filter by userIds if 'all' is not present
          .andWhere(userIds.includes('all') ? '1=1' : 'plan.userId IN (:...userIds)', userIds.includes('all') ? {} : { userIds }) 
          .andWhere('planningUser.planningPeriodId = :planningPeriodId', { planningPeriodId }) // Filter by planningPeriodId
          .andWhere('plan.isValidated = :isValidated', { isValidated: true }) // Check if isValidated is true
          .andWhere('plan.isReported IS NULL') // Check if isReported is null
          .getMany();
        
        
          return reportTasks;
        } catch (error) {
          throw new ConflictException(error.message);
        }
      }
      async deleteReportTasks(reportTaskId: string) {
        try {
          // Directly delete using the reportTaskId
          const deleteReportTask = await this.reportTaskRepo.delete(reportTaskId);
          
          // Check if the deletion was successful
          if (deleteReportTask.affected === 0) {
            throw new ConflictException('Report task not found or already deleted.');
          }
      
          return deleteReportTask;
        } catch (error) {
          throw new ConflictException(error.message);
        }
      }
      
}
