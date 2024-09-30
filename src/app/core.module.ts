import { Global, Module } from '@nestjs/common';
<<<<<<< HEAD

import { PermissionModule } from './modules/permission/permission.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ReportCommentsModule } from './modules/report-comments/report-comments.module';
import { OkrReportModule } from './modules/okr-report/okr-report.module';
import { OkrReportTaskModule } from './modules/okr-report-task/okr-report-task.module';
import { FailureReasonModule } from './modules/failure-reason/failure-reason.module';
@Global()
@Module({
  imports: [
    PermissionModule,
    ProductsModule,
    UsersModule,
    ClientsModule,
    // ReportCommentsModule,
    OkrReportModule,
    // OkrReportTaskModule,
    FailureReasonModule,
=======
import { ObjectiveModule } from './modules/objective/objective.module';
import { MilestonesModule } from './modules/milestones/milestones.module';
import { MetricTypesModule } from './modules/metric-types/metric-types.module';
import { KeyResultsModule } from './modules/key-results/key-results.module';
import { PlanTasksModule } from './modules/plan-tasks/plan-tasks.module';
import { PlanningPeriodsModule } from './modules/planningPeriods/planning-periods/planning-periods.module';
import { PlanModule } from './modules/plan/plan.module';
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
>>>>>>> 79e1d25b5080b379f28be587be0397f375e40512
  ],
})
export class CoreModule {}
