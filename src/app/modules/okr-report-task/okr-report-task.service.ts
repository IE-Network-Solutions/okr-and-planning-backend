import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportTask } from './entities/okr-report-task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportTaskDTO } from './dto/create-okr-report-task.dto';
import { In, Repository } from 'typeorm';
import { UUID } from 'crypto';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { Plan } from '../plan/entities/plan.entity';
import { OkrReportService } from '../okr-report/okr-report.service';
import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';

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
  async create(
    createReportDto: ReportTaskDTO,
    tenantId: string,
    planningPeriodId: string,
    userId: string,
  ): Promise<ReportTask[]> {
    const planningPeriodUserId = await this.getPlanningPeriodUserId(
      tenantId,
      userId,
      planningPeriodId,
    );
    if (!planningPeriodUserId) {
      throw new Error('Planning period user not found');
    }

    const planId = await this.getPlanId(planningPeriodUserId);
    if (!planId) {
      throw new Error('Plan not found for the given planning period user');
    }

    const reportScore = await this.calculateReportScore(createReportDto);
    const reportData = this.createReportData(
      reportScore,
      planId,
      userId,
      tenantId,
    );

    const returnedReportData = await this.reportService.createReportWithTasks(
      reportData,
    );
    const reportTasks = this.mapDtoToReportTasks(
      createReportDto,
      returnedReportData,
      tenantId,
    );
    // Object.entries(createReportDto).map(([key, value]) => {
    //   if(value.status){
    //     const planTaskExistedAndIsAchieveMK=this.checkAndUpdateProgressByKey(key)

    //   }
    // });
    return await this.reportTaskRepo.save(reportTasks);
  }
  async checkAndUpdateProgressByKey(planTaskKey: string): Promise<boolean> {
    try {
      const planTask = await this.planTaskRepository.findOne({
        where: { id: planTaskKey }, // Assuming the key is the ID
      });
      if (planTask && planTask.achieveMK) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
  private createReportData(
    reportScore: number,
    planId: string,
    userId: string,
    tenantId: string,
  ) {
    return {
      reportScore: `${reportScore}%`, // Adjust as necessary
      reportTitle: new Date().toISOString(), // Set to current date in ISO format
      planId: planId,
      userId: userId,
      tenantId: tenantId,
    };
  }
  private mapDtoToReportTasks(
    dto: Record<
      string,
      {
        status: string;
        actualValue?: number;
        isAchieved?: boolean;
        reason?: string;
        failureReasonId?: string;
      }
    >,
    reporteData,
    tenantId: string,
  ): ReportTask[] {
    return Object.entries(dto).map(([key, value]) => {
      const reportTask = new ReportTask();
      (reportTask.planTaskId = key),
        (reportTask.reportId = reporteData?.id),
        (reportTask.status = value.status as ReportStatusEnum);
      reportTask.isAchived = value?.isAchieved ?? false;
      reportTask.tenantId = tenantId || null;
      reportTask.actualValue = value?.actualValue ? `${value?.actualValue}`:null;
      reportTask.customReason = value?.reason || null;
      reportTask.failureReasonId = value?.failureReasonId || null;
      return reportTask;
    });
  }
  async getPlanningPeriodUserId(
    tenantId: string,
    userId: string,
    planningPeriodId: string,
  ): Promise<string | null> {
    try {
      const planningPeriodUser =
        await this.planningPeriodUserRepository.findOne({
          where: {
            tenantId: tenantId,
            userId: userId,
            planningPeriodId: planningPeriodId,
          },
        });
      return planningPeriodUser ? planningPeriodUser.id : null; // Return the id or null if not found
    } catch (error) {
      throw new Error(
        `Error fetching planning period user ID: ${error.message}`,
      );
    }
  }
  async getPlanId(planningPeriodUserId: string): Promise<string | null> {
    try {
      const plan = await this.planRepository.findOne({
        where: {
          planningUserId: planningPeriodUserId,
        },
      });
      return plan ? plan.id : null; // Return the id or null if not found
    } catch (error) {
      throw new Error(`Error fetching plan ID: ${error.message}`);
    }
  }
  async calculateReportScore(
    taskData: Record<string, { status: string }>,
  ): Promise<number> {
    const totalTasks = Object.keys(taskData).length; // Total number of tasks
    const completedTasks = Object.values(taskData).filter(
      (task) => task.status === 'Done',
    ).length; // Count of "Done" tasks

    // Calculate the report score as a percentage
    const reportScore =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return reportScore; // Return the calculated report score
  }

  async getUnReportedPlanTasks(
    userId: string,
    planningPeriodId: string,
    tenantId: string,
  ): Promise<any> {
    try {
      // Fetch all plan tasks where reports have not been created yet
      const unreportedTasks = await this.planTaskRepository
        .createQueryBuilder('planTask')
        .leftJoinAndSelect('planTask.plan', 'plan')
        .leftJoinAndSelect('planTask.milestone', 'milestone')
        .leftJoinAndSelect('planTask.keyResult', 'keyResult')
        .leftJoinAndSelect('keyResult.objective', 'objective') // Add join with objective
        .leftJoinAndSelect('keyResult.metricType', 'metricType') // Add join with metricType
        .leftJoinAndSelect('planTask.parentTask', 'parentTask')
        .leftJoinAndSelect('plan.planningUser', 'planningUser') // Add relation to planningUser from the Plan entity

        // Fetch unreported plan tasks based on userId, tenantId, and planningPeriodId
        .where('plan.isReported = :isReported', { isReported: false })
        .andWhere('plan.tenantId = :tenantId', { tenantId })
        .andWhere('plan.userId = :userId', { userId })
        .andWhere('planningUser.planningPeriodId = :planningPeriodId', {
          planningPeriodId,
        })
        .getMany();

      return unreportedTasks;
    } catch (error) {
      throw new ConflictException(
        `Error fetching unreported tasks: ${error.message}`,
      );
    }
  }

  async findAllReportTasks(
    tenantId: UUID,
    userIds: string[],
    planningPeriodId: string,
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
        .andWhere(
          userIds.includes('all') ? '1=1' : 'plan.userId IN (:...userIds)',
          userIds.includes('all') ? {} : { userIds },
        )
        .andWhere('planningUser.planningPeriodId = :planningPeriodId', {
          planningPeriodId,
        }) // Filter by planningPeriodId
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
        throw new ConflictException(
          'Report task not found or already deleted.',
        );
      }

      return deleteReportTask;
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }
}
