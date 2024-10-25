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
import { PlanningPeriodsModule } from '../planningPeriods/planning-periods/planning-periods.module';
import { PlanningPeriodsService } from '../planningPeriods/planning-periods/planning-periods.service';
import { PlanningPeriod } from '../planningPeriods/planning-periods/entities/planningPeriod.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      ReportTask,
      FailureReason,
      PlanningPeriodUser,
      Plan,
    ]),
   PlanningPeriodsModule
    
  ],
  controllers: [OkrReportController],
  providers: [
    OkrReportService,
    OrgEmployeeInformationApiService,
    
  ],
  exports: [OkrReportService],
})
export class OkrReportModule {}
