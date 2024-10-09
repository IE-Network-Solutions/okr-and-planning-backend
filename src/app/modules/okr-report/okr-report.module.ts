import { Module } from '@nestjs/common';
import { OkrReportController } from './okr-report.controller';
import { OkrReportService } from './okr-report.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/okr-report.entity';
import { ReportTask } from '../okr-report-task/entities/okr-report-task.entity';
import { FailureReason } from '../failure-reason/entities/failure-reason.entity';
import { OrgEmployeeInformationApiService } from './custom-service/api-service/get-data-from-org.service';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { Plan } from '../plan/entities/plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      ReportTask,
      FailureReason,
      PlanningPeriodUser,
      Plan,
    ]),
  ],
  controllers: [OkrReportController],
  providers: [
    OkrReportService,
    OrgEmployeeInformationApiService,
    OkrReportService,
  ],
  exports: [OkrReportService],
})
export class OkrReportModule {}
