import { Module } from '@nestjs/common';
import { OkrProgressService } from './okr-progress.service';
import { OkrProgressController } from './okr-progress.controller';
import { KeyResultsModule } from '../key-results/key-results.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { MetricTypesModule } from '../metric-types/metric-types.module';

@Module({
  imports: [KeyResultsModule, MetricTypesModule, MilestonesModule],
  controllers: [OkrProgressController],
  providers: [OkrProgressService],
  exports: [OkrProgressService],
})
export class OkrProgressModule {}
