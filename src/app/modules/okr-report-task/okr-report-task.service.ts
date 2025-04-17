import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReportTask } from './entities/okr-report-task.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ReportTaskInput } from './dto/create-okr-report-task.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
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
import { UserVpScoringService } from '../variable_pay/services/user-vp-scoring.service';
import { CreateReportDTO } from '../okr-report/dto/create-report.dto';
import { PlanTasksService } from '../plan-tasks/plan-tasks.service';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';
import { In } from 'typeorm';

@Injectable()
export class OkrReportTaskService {
  constructor(
    @InjectRepository(ReportTask)
    private reportTaskRepo: Repository<ReportTask>,

    @InjectRepository(PlanningPeriodUser)
    private planningPeriodUserRepository: Repository<PlanningPeriodUser>,

    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,

    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,

    @InjectDataSource() private readonly dataSource: DataSource,

    @InjectRepository(PlanTask)
    private planTaskRepository: Repository<PlanTask>,


    private reportService: OkrReportService,

    private okrProgressService: OkrProgressService,
    private userVpScoringService: UserVpScoringService,
    private getFromOrganizatiAndEmployeInfoService: GetFromOrganizatiAndEmployeInfoService,
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
    createReportDto: ReportTaskInput,
    tenantId: string,
    planningPeriodId: string,
    userId: string,
    planningId?: string,
    sessionId?: string,
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
      const planningDataId = planningId ?? planId;
      const reportScore = await this.calculateReportScore(createReportDto);

      const reportData = this.createReportData({
        reportScore,
        planId: planningDataId,
        userId,
        tenantId,
      });
      const returnedReportData = await this.reportService.createReportWithTasks(
        reportData,
        tenantId,
        sessionId,
      );
      const reportTasks = this.mapDtoToReportTasks(
        createReportDto,
        returnedReportData,
        tenantId,
      );
      const savedReportTasks = await this.reportTaskRepo.save(reportTasks);
      const checkPlanIsReported = await this.updatePlanIsReported(
        planningDataId,
      );
      const check = await this.checkAndUpdateProgressByKey(savedReportTasks);

      if (check && checkPlanIsReported) {
        // const vp = await this.userVpScoringService.calculateVP(
        //   userId,
        //   tenantId,
        // );
        await queryRunner.commitTransaction();
      }
      return savedReportTasks;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async checkAndUpdateProgressByKey(
    savedReportTasks: ReportTask[],
    isOnCreate: 'ON_CREATE' | 'ON_UPDATE' | 'ON_DELETE' = 'ON_CREATE',
    reportTask: ReportTask[] = [],
  ): Promise<any[]> {
    const reportTaskData = (reportTaskId: string) =>
      reportTask.find((task) => task.id === reportTaskId);

    const results = [];

    for (const task of savedReportTasks) {
      try {
        const planTask = await this.planTaskRepository.findOne({
          where: { id: task?.planTaskId },
        });

        if (!planTask) continue;

        const metricsType = await this.getPlanTaskById(planTask.id);

        switch (metricsType?.keyResult?.metricType.name) {
          case NAME.MILESTONE: {
            const milestoneUpdate = await this.findMilestoneById(
              planTask?.milestoneId,
            );
            if (!milestoneUpdate)
              throw new Error(
                `Milestone with ID ${planTask?.milestoneId} not found`,
              );

            const updatedStatus =
              isOnCreate !== 'ON_DELETE' && planTask.achieveMK
                ? task.status === 'Done'
                  ? Status.COMPLETED
                  : Status.NOTCOMPLETED
                : Status.NOTCOMPLETED;

            await this.updateMilestone(planTask?.milestoneId, {
              ...milestoneUpdate,
              status: updatedStatus,
              updatedAt: new Date(),
            });

            const progressUpdate =
              await this.okrProgressService.calculateKeyResultProgress({
                keyResult: planTask.keyResult,
                isOnCreate,
              });

            results.push(progressUpdate);
            break;
          }

          case NAME.ACHIEVE: {
            if (planTask.achieveMK && planTask.keyResult) {
              const progress =
                isOnCreate === 'ON_DELETE' && task.status === 'Done'
                  ? 0
                  : task.status === 'Done'
                  ? 100
                  : 0;

              results.push(
                await this.okrProgressService.calculateKeyResultProgress({
                  keyResult: { ...planTask.keyResult, progress },
                  isOnCreate,
                }),
              );
            }
            break;
          }

          default: {
            const actualValueToUpdate =
              reportTaskData(task.id)?.actualValue ?? 0;
            const actualValue = parseFloat(
              task?.actualValue?.toString() || '0',
            );

            if (['ON_CREATE', 'ON_UPDATE', 'ON_DELETE'].includes(isOnCreate)) {
              results.push(
                await this.okrProgressService.calculateKeyResultProgress({
                  keyResult: { ...planTask.keyResult, actualValue },
                  isOnCreate,
                  actualValueToUpdate,
                }),
              );
            }
          }
        }
      } catch (error) {}
    }

    return results.filter(Boolean);
  }

  // Method to update the isReported value of the plan
  private async updatePlanIsReported(planId: string): Promise<any> {
    try {
      const createPlan = await this.planRepository.update(planId, {
        isReported: true,
      });
      return createPlan;
    } catch (error) {
      throw new Error(
        `Could not update plan status for the ID , it already Reported`,
      );
    }
  }

  async updateReportTasks(
    reportId: string,
    reportTask: ReportTaskInput,
  ): Promise<void> {
    try {
      const reportScore = await this.calculateReportScore(reportTask);
      const updateReportScore = await this.reportService.update(reportId, {
        reportScore,
      });

      const currentTasks = await this.reportTaskRepo.find({
        where: { reportId },
      });
      const newTasks = Object.entries(reportTask).map(([taskId, value]) => ({
        planTaskId: taskId,
        updatePayload: {
          status: value.status as ReportStatusEnum,
          failureReasonId: value?.failureReasonId ?? null,
          isAchieved: value.status === 'Done',
          actualValue: value?.actualValue?.toString() ?? '0', // Convert to string
          customReason: value?.customReason ?? null,
        },
      }));
      const savedReportTasks = [];
      for (const { planTaskId, updatePayload } of newTasks) {
        const existingTask = currentTasks.find(
          (task) => task.planTaskId === planTaskId,
        );

        if (existingTask) {
          await this.reportTaskRepo.update({ planTaskId }, updatePayload);

          const updatedTask = await this.reportTaskRepo.findOne({
            where: { planTaskId },
          });

          if (updatedTask) {
            savedReportTasks.push(updatedTask);
          }
        }
      }

      const check = await this.checkAndUpdateProgressByKey(
        savedReportTasks,
        'ON_UPDATE',
        currentTasks,
      );
    } catch (error) {
      throw new Error(
        `Could not update the report task. Reason: ${error.message}`,
      );
    }
  }

  private createReportData({
    reportScore,
    planId,
    userId,
    tenantId,
  }: CreateReportDTO) {
    return {
      status: ReportStatusEnum.Drafted,
      reportScore: `${reportScore}%`, // Adjust as necessary
      reportTitle: new Date().toISOString(), // Set to current date in ISO format
      planId: planId,
      userId: userId,
      tenantId: tenantId,
    };
  }
  private mapDtoToReportTasks(
    dto: ReportTaskInput,
    reportData: any,
    tenantId: string,
  ): Record<string, any>[] {
    // Change return type to an array of plain objects
    return Object.entries(dto).map(([key, value]) => {
      return {
        planTaskId: key,
        reportId: reportData?.id,
        status: value.status as ReportStatusEnum,
        isAchieved: value?.status === 'Done' ? true : false,
        tenantId: tenantId || null,
        actualValue: value?.actualValue ?? 0,
        customReason: value?.customReason || null,
        failureReasonId: value?.failureReasonId || null,
      };
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
      return plan ? plan.id : null; // Retur  n the id or null if not found
    } catch (error) {
      throw new Error(`Error fetching plan ID: ${error.message}`);
    }
  }
  async calculateReportScore(
    taskData: Record<string, { status: string }>,
  ): Promise<string> {
    const totalTasks = Object.keys(taskData).length; // Total number of tasks
    const completedTasks = Object.values(taskData).filter(
      (task) => task.status === 'Done',
    ).length; // Count of "Done" tasks

    // Calculate the report score as a percentage
    const reportScore =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return `${reportScore}%`; // Return the calculated report score
  }
  async getUnReportedPlanTasks(
    userId: string,
    planningPeriodId: string,
    tenantId: string,
    forPlan: string,
    sessionId?: string,
  ): Promise<PlanTask[]> {
    try {
      // Convert forPlan to boolean: '1' -> true, '2' -> false, default -> true
      const isForPlan = forPlan === '1' ? true : forPlan === '2' ? false : true;

      // Resolve sessionId if not provided
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const activeSession =
          await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
            tenantId,
          );
        if (!activeSession) {
          throw new NotFoundException(
            'No active session found for this tenant',
          );
        }
        activeSessionId = activeSession.id;
      }

      const queryBuilder = this.planTaskRepository
        .createQueryBuilder('planTask')
        .leftJoinAndSelect('planTask.plan', 'plan')
        .leftJoinAndSelect('planTask.milestone', 'milestone')
        .leftJoinAndSelect('planTask.keyResult', 'keyResult')
        .leftJoinAndSelect('keyResult.objective', 'objective')
        .leftJoinAndSelect('keyResult.metricType', 'metricType')
        .leftJoinAndSelect('planTask.parentTask', 'parentTask')
        .leftJoinAndSelect('plan.planningUser', 'planningUser')
        .where('plan.tenantId = :tenantId', { tenantId })
        .andWhere('plan.createdBy = :userId', { userId })
        .andWhere('planningUser.planningPeriodId = :planningPeriodId', {
          planningPeriodId,
        })
        .andWhere('plan.sessionId = :activeSessionId', { activeSessionId })
        .andWhere('planTask.planId IS NOT NULL');

      // Apply reporting filters based on isForPlan
      if (!isForPlan) {
        queryBuilder.andWhere('plan.isReported = :isReported', {
          isReported: false,
        });
      } else {
        queryBuilder
          .andWhere('plan.isReportValidated = :isReportValidated', {
            isReportValidated: false,
          })
          .andWhere('plan.isReported = :isReported', { isReported: true });
      }

      return await queryBuilder.getMany();
    } catch (error) {
      throw new NotFoundException(
        `Failed to fetch unreported tasks: ${error.message}`,
      );
    }
  }
  async findAllReportTasks(
    tenantId: UUID,
    userIds: string[],
    planningPeriodId: string,
    sessionId?: string,
  ) {
    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const activeSession =
          await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
            tenantId,
          );
        activeSessionId = activeSession.id;
        if (!activeSession) {
          throw new NotFoundException(
            'No active session found for this tenant',
          );
        }
      }
      // Fetch all report tasks that match the given tenantId, userIds, and planningPeriodId
      const reportTasks = await this.reportTaskRepo
        .createQueryBuilder('reportTask') // Start from reportTask
        .leftJoinAndSelect('reportTask.planTask', 'planTask') // Join planTask
        .leftJoinAndSelect('reportTask.report', 'report')
        .leftJoinAndSelect('planTask.plan', 'plan') // Join plan
        .leftJoinAndSelect('plan.planningUser', 'planningUser') // Join planningUser
        .leftJoinAndSelect('planTask.keyResult', 'keyResult') // Join KeyResult for details
        .leftJoinAndSelect('planTask.milestone', 'milestone') // Join milestone
        .where('reportTask.tenantId = :tenantId', { tenantId }) // Filter by tenantId
        .andWhere('report.sessionId = :sessionId', { sessionId:activeSessionId })
        // Conditionally filter by userIds if 'all' is not present
        .andWhere(
          userIds.includes('all') ? '1=1' : 'plan.userId IN (:...userIds)',
          userIds.includes('all') ? {} : { userIds },
        )
        .andWhere('planningUser.planningPeriodId = :planningPeriodId', {
          planningPeriodId,
        }) // Filter by planningPeriodId
        // .andWhere('plan.isValidated = :isValidated', { isValidated: true }) // Check if isValidated is true
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
  async deleteReportTasksByReportId(
    reportId: string,
    transactionalEntityManager?: EntityManager,
  ) {
    try {
      // Use transactionalEntityManager if provided, else fallback to default repository
      const manager = transactionalEntityManager || this.reportTaskRepo.manager;
      // Find all report tasks associated with the given reportId

      const reportTasks = await manager.find(ReportTask, {
        where: { reportId },
      });
      // Perform a soft delete on the fetched tasks
      const deletedTasks = await manager.softRemove(reportTasks);
      return deletedTasks;
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }

  async getReportTasks(planTaskId: string): Promise<ReportTask[]> {
    return this.reportTaskRepo.find({ where: { planTaskId } });
  }

  async getReportTasksByReportId(reportId: string): Promise<ReportTask[]> {
    return this.reportTaskRepo.find({ where: { reportId } });
  }
}
