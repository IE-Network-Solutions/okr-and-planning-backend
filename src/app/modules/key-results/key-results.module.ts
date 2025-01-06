import { Module } from '@nestjs/common';
import { KeyResultsService } from './key-results.service';
import { KeyResultsController } from './key-results.controller';
import { PaginationModule } from '@root/src/core/pagination/pagination.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyResult } from './entities/key-result.entity';
import { MilestonesModule } from '../milestones/milestones.module';
import { MetricTypesModule } from '../metric-types/metric-types.module';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeyResult]),
    PaginationModule,
    MilestonesModule,
    MetricTypesModule,
     HttpModule.register({}),
  ],
  controllers: [KeyResultsController],
  providers: [KeyResultsService,GetFromOrganizatiAndEmployeInfoService],
  exports: [KeyResultsService],
})
export class KeyResultsModule {}
