import { forwardRef, Module } from '@nestjs/common';
import { OkrReportTaskController } from './okr-report-task.controller';
import { OkrReportTaskService } from './okr-report-task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportTask } from './entities/okr-report-task.entity';
import { Report } from '../okr-report/entities/okr-report.entity';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { Plan } from '../plan/entities/plan.entity';
import { KeyResultsModule } from '../key-results/key-results.module';
import { OkrProgressModule } from '../okr-progress/okr-progress.module';
import { KeyResult } from '../key-results/entities/key-result.entity';
import { MetricType } from '../metric-types/entities/metric-type.entity';
import { Milestone } from '../milestones/entities/milestone.entity';
import { PlanningPeriodsModule } from '../planningPeriods/planning-periods/planning-periods.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { MetricTypesModule } from '../metric-types/metric-types.module';
import { OkrReportModule } from '../okr-report/okr-report.module';
import { VariablePayModule } from '../variable_pay/variable-pay.module';
import { PaginationModule } from '@root/src/core/pagination/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportTask,
      Report,
      PlanTask,
      PlanningPeriodUser,
      Plan,
      KeyResult,
      MetricType,
      Milestone,
    ]),
    OkrProgressModule,
    KeyResultsModule,
    PlanningPeriodsModule,
    KeyResultsModule,
    MilestonesModule,
    MetricTypesModule,
    OkrProgressModule,
    PaginationModule,
    VariablePayModule,
    forwardRef(() => OkrReportModule),
  ],
  controllers: [OkrReportTaskController],
  providers: [OkrReportTaskService],
  exports: [OkrReportTaskService],
})
export class OkrReportTaskModule {}
