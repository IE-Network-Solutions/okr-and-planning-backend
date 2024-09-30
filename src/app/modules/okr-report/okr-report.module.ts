import { Module } from '@nestjs/common';
import { OkrReportController } from './okr-report.controller';
import { OkrReportService } from './okr-report.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/okr-report.entity';
import { ReportTask } from '../okr-report-task/entities/okr-report-task.entity';
import { FailureReason } from '../failure-reason/entities/failure-reason.entity';
import { OrgEmployeeInformationApiService } from './api-service/get-data-from-org.service';

@Module({
  imports: [TypeOrmModule.forFeature([Report,ReportTask,FailureReason])],
  controllers: [OkrReportController],
  providers: [OkrReportService,OrgEmployeeInformationApiService],
  exports: [OkrReportService],
})
export class OkrReportModule {}
