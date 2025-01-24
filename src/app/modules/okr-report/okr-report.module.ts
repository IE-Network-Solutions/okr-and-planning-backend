import { forwardRef, Module } from '@nestjs/common';
import { OkrReportController } from './okr-report.controller';
import { OkrReportService } from './okr-report.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/okr-report.entity';
import { OrgEmployeeInformationApiService } from './custom-service/api-service/get-data-from-org.service';
import { PlanningPeriodsModule } from '../planningPeriods/planning-periods/planning-periods.module';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';
import { HttpModule } from '@nestjs/axios';
import { OkrReportTaskModule } from '../okr-report-task/okr-report-task.module';
import { PlanModule } from '../plan/plan.module';
import { FailureReasonModule } from '../failure-reason/failure-reason.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    PlanningPeriodsModule,
    HttpModule,
    forwardRef(() => OkrReportTaskModule),
    PlanModule,
    PlanningPeriodsModule,
    FailureReasonModule,
  ],
  controllers: [OkrReportController],
  providers: [
    OkrReportService,
    OrgEmployeeInformationApiService,
    GetFromOrganizatiAndEmployeInfoService,
  ],
  exports: [OkrReportService],
})
export class OkrReportModule {}
