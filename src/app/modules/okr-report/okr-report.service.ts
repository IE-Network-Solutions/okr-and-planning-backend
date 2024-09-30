import {  Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './entities/okr-report.entity';
import { Repository } from 'typeorm';
import { ReportTask } from '../okr-report-task/entities/okr-report-task.entity';
import { FailureReason } from '../failure-reason/entities/failure-reason.entity';
import { ReportDTO } from './dto/create-report.dto';

@Injectable()
export class OkrReportService {


      constructor(
        @InjectRepository(Report) private reportRepo: Repository<Report>,
        @InjectRepository(ReportTask) private reportTaskRepo: Repository<ReportTask>,
        @InjectRepository(FailureReason) private failureReasonRepo: Repository<FailureReason>,
      ) {}
    
      async createReport(reportDto: any,tenantId:string): Promise<Report> {
        const report = this.reportRepo.create({
          user: { id: reportDto.userId },
          plan: { id: reportDto.planId },
          status: reportDto.status,
          reportScore: reportDto.reportScore,
          tenant: { id: reportDto.tenantId },
        });
    
        const savedReport = await this.reportRepo.save(report);
    
        // Loop through the tasks and create ReportTask entries
        for (const taskDto of reportDto.tasks) {
          let failureReason = null;
    
          // Check if a failure reason exists
          if (taskDto.failureReason) {
            failureReason = await this.failureReasonRepo.save({
              id: taskDto.failureReason.id,
              name: taskDto.failureReason.name,
              description: taskDto.failureReason.description,
              tenant: { id: taskDto.failureReason.tenantId },
            });
          }
    
          // Save the report task
          await this.reportTaskRepo.save({
            id: taskDto.id,
            report: savedReport,
            planTask: { id: taskDto.planTaskId },
            failureReason,
            actualValue: taskDto.actualValue,
            isAchieved: taskDto.isAchieved,
            customReason: taskDto.customReason,
            tenant: { id: taskDto.tenantId },
          });
        }
    
        return savedReport;
      }
async getAllReportsByTenantAndPeriod(tenantId: string, userIds: string[],planningPeriodId:string): Promise<any[]> {
  // Fetch reports that match the tenantId and userIds

  const reports = await this.reportRepo.createQueryBuilder('report')
  .leftJoinAndSelect('report.reportTask', 'report_task') // Join with report_task
  .where('report.tenantId = :tenantId', { tenantId })
  .andWhere('report.userId IN (:...userIds)', { userIds })
  .getMany();

// Structure the data by grouping reports under each user
const groupedResults = userIds.map(id => {
  const userReports = reports.filter(report => report.userId === id);
  return {
    userId: id,
    reports: userReports.map(report => ({
      id: report.id,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      deletedAt: report.deletedAt,
      status: report.status,
      reportScore: report.reportScore,
      reportTitle: report.reportTitle,
      tenantId: report.tenantId,
      userId: report.userId,
      tasks: report.reportTask // Fetch and include all reportTask attributes
    }))
  };
});

return groupedResults;
}
      

        // Method to delete a report by id and tenantId
  async deleteReport(id: string, tenantId: string): Promise<void> {
    const report = await this.reportRepo.findOne({
      where: { id, tenant: { id: tenantId } },  // Ensure the tenantId matches
    });

    if (!report) {
      throw new NotFoundException(`Report with ID not found`);
    }
    await this.reportRepo.remove(report);
  }
}
