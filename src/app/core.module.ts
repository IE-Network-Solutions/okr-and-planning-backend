import { Global, Module } from '@nestjs/common';
import { ObjectiveModule } from './modules/objective/objective.module';
import { MilestonesModule } from './modules/milestones/milestones.module';
import { MetricTypesModule } from './modules/metric-types/metric-types.module';
import { KeyResultsModule } from './modules/key-results/key-results.module';
import { PlanTasksModule } from './modules/plan-tasks/plan-tasks.module';
import { PlanningPeriodsModule } from './modules/planningPeriods/planning-periods/planning-periods.module';
import { PlanModule } from './modules/plan/plan.module';
import { OkrProgressModule } from './modules/okr-progress/okr-progress.module';

import { ReprimandLogModule } from './modules/reprimandLog/reprimand-log.module';
import { AppreciationModule } from './modules/appreciationLog/appreciation.module';
import { CarbonCopyLog } from './modules/carbonCopyLlog/entities/carbon-copy-log.entity';
import { RecognitionTypeModule } from './modules/recognitionType/recognition-type.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
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
    OkrProgressModule,
    RecognitionTypeModule,
    ReprimandLogModule,
    AppreciationModule,
    CarbonCopyLog,
    DashboardModule,
  ],
})
export class CoreModule {}

