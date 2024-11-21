import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './entities/okr-report.entity';
import { In, Repository } from 'typeorm';
import { ReportTask } from '../okr-report-task/entities/okr-report-task.entity';
import { CreateReportDTO } from './dto/create-report.dto';
import { UUID } from 'crypto';
import { RockStarDto } from './dto/report-rock-star.dto';
import { PlanningPeriodsService } from '../planningPeriods/planning-periods/planning-periods.service';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';

import { startOfWeek, endOfWeek } from 'date-fns';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';

import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';


@Injectable()
export class OkrReportService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
    @InjectRepository(ReportTask)
    private reportTaskRepository: Repository<ReportTask>,
    private planningPeriodService: PlanningPeriodsService,
    private readonly getFromOrganizatiAndEmployeInfoService: GetFromOrganizatiAndEmployeInfoService,
  ) {}

  async createReportWithTasks(
    reportData: CreateReportDTO, // Data for the Report entity
  ): Promise<Report> {
    // Step 1: Create the Report entity
    const report = this.reportRepository.create({
      status: ReportStatusEnum.Reported,
      reportScore: reportData.reportScore,
      reportTitle: reportData.reportTitle,
      tenantId: reportData?.tenantId,
      userId: reportData?.userId,
      planId: reportData.planId,
    });

    // Step 2: Save the Report entity
    const savedReport = await this.reportRepository.save(report);
    if (!savedReport) {
      throw new Error('Report not Saved');
    }
    // Step 5: Return the saved report and its associated tasks
    return savedReport;
  }

  async getAllReportsByTenantAndPeriod(
    tenantId: UUID,
    userIds: string[],
    planningPeriodId: string,
  ): Promise<any> {
    // Use queryBuilder to fetch reports with complex filtering
    const reports = await this.reportRepository
      .createQueryBuilder('report') // Start from the 'report' entity
      .leftJoinAndSelect('report.reportTask', 'reportTask') // Join 'reportTask'
      .leftJoinAndSelect('report.comments', 'ReportComment') // Join 'ReportComment' (adjust alias here)
      .leftJoinAndSelect('reportTask.planTask', 'planTask') // Join 'planTask'
      .leftJoinAndSelect('planTask.plan', 'plan') // Join 'plan'
      .leftJoinAndSelect('plan.planningUser', 'planningUser') // Join 'planningUser'
      .leftJoinAndSelect('planTask.keyResult', 'keyResult') // Join 'keyResult'
      .leftJoinAndSelect('planTask.milestone', 'milestone') // Join 'milestone'

      // Apply filtering conditions
      .where('report.tenantId = :tenantId', { tenantId }) // Filter by tenantId
      .andWhere(
        userIds.includes('all') ? '1=1' : 'report.userId IN (:...userIds)',
        userIds.includes('all') ? {} : { userIds },
      )
      .andWhere('planningUser.planningPeriodId = :planningPeriodId', {
        planningPeriodId,
      }) // Filter by planningPeriodId

      // Order by createdAt in descending order (latest first)
      .orderBy('report.createdAt', 'DESC')

      .getMany(); // Fetch the results

    return reports;
  }

  // Method to delete a report by id and tenantId
  async deleteReport(id: string, tenantId: UUID): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { tenantId: tenantId }, // Ensure the tenantId matches
    });

    if (!report) {
      throw new NotFoundException(`Report with ID not found`);
    }
    await this.reportRepository.remove(report);
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

    return topEmployees;
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
    return reports;
    //   const maxScore = Math.max(...reports.map((item) => parseFloat(item.report_reportScore.split('%')[0])));
    // console.log(maxScore,"maxScore")
    //   return reports.filter((item) => parseFloat(item.report_reportScore.split('%')[0]) === maxScore);
  }
}
