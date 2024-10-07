import { Global, Module } from '@nestjs/common';
import { ObjectiveModule } from './modules/objective/objective.module';
import { MilestonesModule } from './modules/milestones/milestones.module';
import { MetricTypesModule } from './modules/metric-types/metric-types.module';
import { KeyResultsModule } from './modules/key-results/key-results.module';
import { PlanTasksModule } from './modules/plan-tasks/plan-tasks.module';
import { PlanningPeriodsModule } from './modules/planningPeriods/planning-periods/planning-periods.module';
import { PlanModule } from './modules/plan/plan.module';
import { OkrProgressModule } from './modules/okr-progress/okr-progress.module';

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
  ],
})
export class CoreModule {}
