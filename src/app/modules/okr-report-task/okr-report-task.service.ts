import { ConflictException, Injectable } from '@nestjs/common';
import { ReportTask } from './entities/okr-report-task.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ReportTaskDTO } from './dto/create-okr-report-task.dto';
import { DataSource, Repository } from 'typeorm';
import { UUID } from 'crypto';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { Plan } from '../plan/entities/plan.entity';
import { OkrReportService } from '../okr-report/okr-report.service';
import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';
import { NAME } from '../metric-types/enum/metric-type.enum';
import { OkrProgressService } from '../okr-progress/okr-progress.service';
import { Milestone } from '../milestones/entities/milestone.entity';
import { Status } from '../milestones/enum/milestone.status.enum';

@Injectable()
export class OkrReportTaskService {
  constructor(
    @InjectRepository(ReportTask)
    private reportTaskRepo: Repository<ReportTask>,

    @InjectRepository(PlanningPeriodUser)
    private planningPeriodUserRepository: Repository<PlanningPeriodUser>,

    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,

    @InjectRepository(Plan)
    private milestoneRepository: Repository<Milestone>,

    @InjectDataSource() private readonly dataSource: DataSource,

    @InjectRepository(PlanTask)
    private planTaskRepository: Repository<PlanTask>,

    private reportService: OkrReportService, // Injecting the report service

    private okrProgressService: OkrProgressService, // Injecting the report service // private okrProgressService: OkrProgressService, // Injecting the report service
  ) {}
  async findMilestoneById(id: string): Promise<Milestone | null> {
    try {
      const milestone = await this.milestoneRepository.findOne({
        where: { id },
      });
      return milestone || null;
    } catch (error) {
      throw new Error('Error finding milestone');
    }
  }
  async updateMilestone(
    id: string,
    updateData: Partial<Milestone>,
  ): Promise<Milestone | null> {
    try {
      const milestone = await this.findMilestoneById(id);
      if (!milestone) return null;
      Object.assign(milestone, updateData);
      return await this.milestoneRepository.save(milestone);
    } catch (error) {
      throw new Error('Error updating milestone');
    }
  }
  async create(
    createReportDto: ReportTaskDTO,
    tenantId: string,
    planningPeriodId: string,
    userId: string,
  ): Promise<ReportTask[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    // Establish the transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
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
      const savedReportTasks = await this.reportTaskRepo.save(reportTasks);
      if (savedReportTasks) {
        await this.updatePlanIsReported(planId);
      }
      await this.checkAndUpdateProgressByKey(savedReportTasks);

      await queryRunner.commitTransaction();
      return savedReportTasks;
    } catch (error) {
      // Rollback transaction if any error occurs
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner after committing or rolling back
      await queryRunner.release();
    }
  }

  async checkAndUpdateProgressByKey(savedReportTasks: any[]): Promise<any[]> {
    try {
      const results = await Promise.all(
        savedReportTasks.map(async (task) => {
          const planTask = await this.planTaskRepository.findOne({
            where: { id: task?.planTaskId },
          });

          if (!planTask) return false;
          const metricsType = await this.getPlanTaskById(planTask.id);

          // Check if the metrics type is MILESTONE before updating the milestone
          if (metricsType?.keyResult?.metricType.name === NAME.MILESTONE) {
            const milestoneUpdate = await this.findMilestoneById(
              planTask?.milestoneId,
            );

            if (milestoneUpdate) {
              // Update milestone properties only if metrics type is MILESTONE
              await this.updateMilestone(planTask?.milestoneId, {
                ...milestoneUpdate,
                status: Status.COMPLETED,
                updatedAt: new Date(),
              });
            }
          }

          switch (metricsType?.keyResult?.metricType.name) {
            case NAME.MILESTONE:
              if (planTask.achieveMK && task.status === 'Done') {
                return await this.okrProgressService.calculateKeyResultProgress(
                  {
                    keyResult: planTask.keyResult,
                    isOnCreate: true,
                  },
                );
              }
              break;
            case NAME.ACHIEVE:
              if (planTask.achieveMK && task.status === 'Done') {
                return await this.okrProgressService.calculateKeyResultProgress(
                  {
                    keyResult: { ...planTask.keyResult, progress: 100 }, // Spreading and adding progress
                    isOnCreate: true,
                    actualValueToUpdate: task?.actualValue,
                  },
                );
              }
              break;
            default:
              if (planTask.status === 'Done') {
                return await this.okrProgressService.calculateKeyResultProgress(
                  {
                    keyResult: {
                      ...planTask.keyResult,
                      actualValue: task?.actualValue,
                    },
                    isOnCreate: true,
                    // actualValueToUpdate: task?.actualValue,
                  },
                );
              }
              break;
          }

          return null; // Return null if no conditions match or the task does not qualify
        }),
      );

      return results;
    } catch (error) {
      return [];
    }
  }

  // Method to update the isReported value of the plan
  private async updatePlanIsReported(planId: string): Promise<void> {
    await this.planRepository.update(planId, { isReported: true });
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
      // reportTask.actualValue = `${value?.actualValue}` ?? null;
      reportTask.customReason = value?.reason || null;
      reportTask.failureReasonId = value?.failureReasonId || null;
      return reportTask;
    });
  }

  private async getPlanTaskById(key: string) {
    return await this.planTaskRepository.findOne({
      where: { id: key },
      relations: ['keyResult', 'keyResult.metricType'],
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
        // .where('plan.isReported = :isReported', { isReported: false })
        // .andWhere('plan.tenantId = :tenantId', { tenantId })
        // .andWhere('plan.userId = :userId', { userId })
        .andWhere('planningUser.planningPeriodId = :planningPeriodId', {
          planningPeriodId,
        }) // Use the relation to access the planningPeriod ID
        .andWhere('plan.isReported = :isReported OR plan.isReported IS NULL', {
          isReported: false,
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
        .andWhere('(plan.isReported IS NULL OR plan.isReported = false)') // Check if isReported is null
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
