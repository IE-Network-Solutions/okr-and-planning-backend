import { Global, Module } from '@nestjs/common';

import { ObjectiveModule } from './modules/objective/objective.module';
import { MilestonesModule } from './modules/milestones/milestones.module';
import { MetricTypesModule } from './modules/metric-types/metric-types.module';
import { KeyResultsModule } from './modules/key-results/key-results.module';
import { PlanTasksModule } from './modules/plan-tasks/plan-tasks.module';
import { PlanningPeriodsModule } from './modules/planningPeriods/planning-periods/planning-periods.module';
import { PlanModule } from './modules/plan/plan.module';
import { ReportCommentsModule } from './modules/report-comments/report-comments.module';
import { OkrReportModule } from './modules/okr-report/okr-report.module';
import { OkrReportTaskModule } from './modules/okr-report-task/okr-report-task.module';
import { FailureReasonModule } from './modules/failure-reason/failure-reason.module';
import { OkrProgressModule } from './modules/okr-progress/okr-progress.module';

import { ReprimandLogModule } from './modules/reprimandLog/reprimand-log.module';
import { AppreciationModule } from './modules/appreciationLog/appreciation.module';
import { CarbonCopyLog } from './modules/carbonCopyLlog/entities/carbon-copy-log.entity';
import { RecognitionTypeModule } from './modules/recognitionType/recognition-type.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { VariablePayModule } from './modules/variable_pay/variable-pay.module';
import { PlanCommentsModule } from './modules/plan-comments/plan-comments.module';
import { WeeklyPrioritiesModule } from './modules/weekly-priorities/weekly-priorities.module';
@Global()
@Module({
  imports: [
    ObjectiveModule,
    MilestonesModule,
    MetricTypesModule,
    KeyResultsModule,
    PlanningPeriodsModule,
    PlanModule,
    PlanTasksModule,
    PlanCommentsModule,

    ReportCommentsModule,
    OkrReportModule,
    OkrReportTaskModule,
    FailureReasonModule,
    OkrProgressModule,
    RecognitionTypeModule,
    ReprimandLogModule,
    AppreciationModule,
    CarbonCopyLog,
    DashboardModule,
    VariablePayModule,
    WeeklyPrioritiesModule,
  ],
})
export class CoreModule {}
