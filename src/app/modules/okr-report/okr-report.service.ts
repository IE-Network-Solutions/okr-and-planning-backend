import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './entities/okr-report.entity';
import { EntityManager, In, Repository } from 'typeorm';
import { ReportTask } from '../okr-report-task/entities/okr-report-task.entity';
import { CreateReportDTO } from './dto/create-report.dto';
import { UUID } from 'crypto';
import { RockStarDto } from './dto/report-rock-star.dto';
import { PlanningPeriodsService } from '../planningPeriods/planning-periods/planning-periods.service';
import { startOfWeek, endOfWeek } from 'date-fns';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';

import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';
import { OkrReportTaskService } from '../okr-report-task/okr-report-task.service';
import { PlanService } from '../plan/plan.service';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationService } from '@root/src/core/pagination/pagination.service';

@Injectable()
export class OkrReportService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
    private planningPeriodService: PlanningPeriodsService,

  //  @Inject(forwardRef(() => OkrReportTaskService))
    private okrReportTaskService: OkrReportTaskService,
    private planService: PlanService,
    private readonly getFromOrganizatiAndEmployeInfoService: GetFromOrganizatiAndEmployeInfoService,
    private readonly paginationService: PaginationService,
  ) {}
  async createReportWithTasks(
    reportData: CreateReportDTO,
    tenantId: string,
    sessionId?: string,
  ): Promise<Report> {
    try {
      let activeSessionId = sessionId;
      
      if (!activeSessionId) {
        try {
          const activeSession =
            await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
              tenantId,
            );
          activeSessionId = activeSession.id;
        } catch (error) {
          throw new NotFoundException('There is no active Session for this tenant');
        }
      }
      
      reportData.sessionId = activeSessionId;
      // Step 1: Create the Report entity
      const report = this.reportRepository.create({
        status: ReportStatusEnum.Reported,
        reportScore: reportData.reportScore,
        reportTitle: reportData.reportTitle,
        tenantId: tenantId,
        userId: reportData?.userId,
        planId: reportData.planId,
        createdBy: reportData?.userId,
        sessionId: reportData.sessionId,
      });

      // Step 2: Save the Report entity
      const savedReport = await this.reportRepository.save(report);
      if (!savedReport) {
        throw new Error('Report not Saved');
      }
      // Step 5: Return the saved report and its associated tasks
      return savedReport;
    } catch (error) {
      throw error;
    }
  }
  async getAllReportsByTenantAndPeriod(
    tenantId: UUID,
    userIds: string[],
    planningPeriodId: string,
    paginationOptions?: PaginationDto,
    sessionId?: string,
  ): Promise<Pagination<Report>> {
    const options: IPaginationOptions = {
      page: paginationOptions?.page,
      limit: paginationOptions?.limit,
    };
    
    let activeSessionId = sessionId;
    
    if (!activeSessionId) {
      try {
        const activeSession =
          await this.getFromOrganizatiAndEmployeInfoService.getActiveSession(
            tenantId,
          );
        activeSessionId = activeSession.id;
      } catch (error) {
        throw new NotFoundException('There is no active Session for this tenant');
      }
    }
    
    // Use queryBuilder to fetch reports with complex filtering
    const reports = await this.reportRepository
      .createQueryBuilder('report') // Start from the 'report' entity
      .leftJoinAndSelect('report.reportTask', 'reportTask') // Join 'reportTask'
      .leftJoinAndSelect('report.comments', 'ReportComment') // Join 'ReportComment' (adjust alias here)
      .leftJoinAndSelect('reportTask.planTask', 'planTask') // Join 'planTask'
      // .leftJoinAndSelect('planTask.plan', 'plan') // Join 'plan'
      .leftJoinAndSelect('report.plan', 'plan') // Join 'reportTask'
      .leftJoinAndSelect('plan.planningUser', 'planningUser') // Join 'planningUser'
      .leftJoinAndSelect('planTask.keyResult', 'keyResult') // Join 'keyResult'
      .leftJoinAndSelect('keyResult.metricType', 'metricType') // Join 'keyResult'

      .leftJoinAndSelect('planTask.milestone', 'milestone') // Join 'milestone'

      // Apply filtering conditions
      .where('report.tenantId = :tenantId', { tenantId }) // Filter by tenantId
      .andWhere('report.sessionId = :sessionId', { sessionId: activeSessionId }) // Filter by sessionId
      .andWhere(
        userIds.includes('all') ? '1=1' : 'report.userId IN (:...userIds)',
        userIds.includes('all') ? {} : { userIds },
      )
      .andWhere('planningUser.planningPeriodId = :planningPeriodId', {
        planningPeriodId,
      })
      .orderBy('report.createdAt', 'DESC'); // Filter by planningPeriodId

    const paginatedData = await this.paginationService.paginate<Report>(
      reports,
      options,
    );

    return paginatedData;
  }

  async deleteReport(id: string, tenantId: UUID): Promise<void> {
    try {
      await this.reportRepository.manager.transaction(
        async (transactionalEntityManager: EntityManager) => {
          const report = await transactionalEntityManager.findOne(Report, {
            where: { id, tenantId },
          });

          if (!report) {
            throw new NotFoundException(
              `Report with ID  not found for tenant ${tenantId}`,
            );
          }

          // const reportTasks =
          //   await this.okrReportTaskService.getReportTasksByReportId(id);

          await transactionalEntityManager.softRemove(report);

          // if (reportTasks.length > 0) {
          //   await this.okrReportTaskService.checkAndUpdateProgressByKey(
          //     reportTasks,
          //     'ON_DELETE',
          //   );
          // }

          const updatedValue = {
            columnName: 'isReported',
            value: false,
          };

          await this.planService.updateByColumn(
            report.planId,
            updatedValue,
            transactionalEntityManager,
          );
        },
      );
    } catch (error) {
      return error;
    }
  }
  async rockStart(rockStarDto: RockStarDto, tenantId: string) {
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 1 });
    const reports = await this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.plan', 'plan')
      .leftJoinAndSelect('plan.planningUser', 'planningUser')
      .leftJoinAndSelect('report.reportTask', 'reportTask')
      .where('planningUser.planningPeriodId = :planningPeriodId', {
        planningPeriodId: rockStarDto.planningPeriodId,
      })
      .andWhere('planningUser.tenantId = :tenantId', { tenantId: tenantId })
      .andWhere(
        'report.createdAt BETWEEN :startOfCurrentWeek AND :endOfCurrentWeek',
        {
          startOfCurrentWeek,
          endOfCurrentWeek,
        },
      )
      .getRawMany();

    for (const report of reports) {
      const user = await this.getFromOrganizatiAndEmployeInfoService.getUsers(
        report.report_userId,
        tenantId,
      );
      report['user'] = user;
    }
    const maxScore = Math.max(
      ...reports.map((item) =>
        parseFloat(item.report_reportScore.split('%')[0]),
      ),
    );
    const topEmployees = reports.filter(
      (item) => parseFloat(item.report_reportScore.split('%')[0]) === maxScore,
    );

    return [];
  }
  async userPerformance(rockStarDto: RockStarDto, tenantId: string) {
    const planningPeriod =
      await this.planningPeriodService.findOnePlanningPeriod(
        rockStarDto.planningPeriodId,
      );

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoin('report.plan', 'plan')
      .leftJoin('plan.planningUser', 'planningUser')
      .leftJoin('report.reportTask', 'reportTask')
      .andWhere('planningUser.tenantId = :tenantId', { tenantId })
      .andWhere('planningUser.userId = :userId', { userId: rockStarDto.userId })
      // .andWhere('reportTask.isAchieved = :isAchieved', { isAchieved: true })
      .andWhere('reportTask.planningPeriodId = :planningPeriodId', {
        planningPeriodId: rockStarDto.planningPeriodId,
      });

    if (planningPeriod.name === 'Weekly') {
      queryBuilder
        .where(
          'EXTRACT(MONTH FROM report.createdAt) = EXTRACT(MONTH FROM CURRENT_DATE)',
        )
        .andWhere(
          'EXTRACT(YEAR FROM report.createdAt) = EXTRACT(YEAR FROM CURRENT_DATE)',
        )
        .addSelect('EXTRACT(WEEK FROM report.createdAt) AS weekNumber')
        .addSelect(
          "SUM(CAST(replace(report.reportScore, '%', '') AS NUMERIC)) AS totalScore",
        )
        .groupBy('weekNumber,report.id');
    } else if (planningPeriod.name === 'Monthly') {
      queryBuilder
        .where("reportTask.createdAt >= NOW() - INTERVAL '12 months'")
        .addSelect('EXTRACT(MONTH FROM report.createdAt) AS month')
        .addSelect('EXTRACT(YEAR FROM report.createdAt) AS year')
        .addSelect(
          "SUM(CAST(replace(report.reportScore, '%', '') AS NUMERIC)) AS totalScore",
        )
        .groupBy('year, month,report.id')
        .orderBy('year', 'ASC')
        .addOrderBy('month', 'ASC');
    }

    const reports = await queryBuilder.getRawMany();
    for (const report of reports) {
      const user = await this.getFromOrganizatiAndEmployeInfoService.getUsers(
        report.report_userId,
        tenantId,
      );
      report['user'] = user;
    }
    return [];
    //   const maxScore = Math.max(...reports.map((item) => parseFloat(item.report_reportScore.split('%')[0])));
    // console.log(maxScore,"maxScore")
    //   return reports.filter((item) => parseFloat(item.report_reportScore.split('%')[0]) === maxScore);
  }

  async getById(id: string): Promise<Report> {
    return await this.reportRepository.findOne({
      where: { id },
      relations: ['reportTask'],
    });
  }

  async update(id: string, updateData: Partial<Report>): Promise<Report> {
    await this.reportRepository.update(id, updateData);
    const updatedReport = await this.reportRepository.findOne({
      where: { id },
      relations: ['reportTask'], // Load relations as needed
    });
    if (!updatedReport) {
      throw new Error(`Report with id ${id} not found`);
    }
    return updatedReport;
  }

  async validate(
    reportId: string,
    tenantId: string,
    value: string,
  ): Promise<Report> {
    try {
      const report = await this.reportRepository.findOne({
        where: { id: reportId, tenantId },
      });

      if (!report) {
        throw new NotFoundException('Report does not exist.');
      }
      const bool = value === 'true';

      const planData = await this.planService.updateIsPlanReportValidated(
        report.planId,
        bool,
      );

      return await this.reportRepository.findOne({ where: { id: reportId } });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw known exceptions.
      }
      throw new InternalServerErrorException(
        'An error occurred while validating the plan.',
      );
    }
  }
}
