import { Global, Module } from '@nestjs/common';
import { ObjectiveModule } from './modules/objective/objective.module';
import { MilestonesModule } from './modules/milestones/milestones.module';
import { MetricTypesModule } from './modules/metric-types/metric-types.module';
import { KeyResultsModule } from './modules/key-results/key-results.module';

@Global()
@Module({
  imports: [
    ObjectiveModule,
    MilestonesModule,
    MetricTypesModule,
    KeyResultsModule,
  ],
})
export class CoreModule {}
