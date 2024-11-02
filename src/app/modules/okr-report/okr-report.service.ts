import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './entities/okr-report.entity';
import { In, Repository } from 'typeorm';
import { ReportTask } from '../okr-report-task/entities/okr-report-task.entity';
import { CreateReportDTO } from './dto/create-report.dto';
import { UUID } from 'crypto';
import { RockStarDto } from './dto/report-rock-star.dto';

@Injectable()
export class OkrReportService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
    @InjectRepository(ReportTask)
    private reportTaskRepository: Repository<ReportTask>,
  ) {}

  async createReportWithTasks(
    reportData: CreateReportDTO, // Data for the Report entity
  ): Promise<Report> {
    // Step 1: Create the Report entity
    const report = this.reportRepository.create({
      // status: ReportStatusEnum[`${reportData.reportScore}`],
      reportScore: reportData.reportScore,
      reportTitle: reportData.reportTitle,
      tenantId: reportData?.tenantId,
      userId: reportData?.userId,
      planId: reportData.planId,
    });

    // Step 2: Save the Report entity
    const savedReport = await this.reportRepository.save(report);

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
    const employees = await this.reportRepository
      .createQueryBuilder('Report')
      .leftJoinAndSelect('Report.plan', 'plan')
      .leftJoinAndSelect('plan.planningUser', 'planningUser')
      .leftJoinAndSelect('planningUser.planningUser', 'planningUser')
      .where('planningUser.planningPeriodId = :planningPeriodId', {
        planningPeriodId: rockStarDto.planningPeriodId,
      })
      .andWhere('planningUser.tenantId = :tenantId', { tenantId: tenantId })
      .andWhere('planningUser.userId = :userId', { userId: rockStarDto.userId })
      .getRawMany();

    const maxScore = Math.max(...employees.map((item) => item.reportScore));
    const topEmployees = employees.filter(
      (item) => item.reportScore === maxScore,
    );
    return topEmployees;
  }
}
