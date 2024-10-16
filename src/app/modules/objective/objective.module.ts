import { Module } from '@nestjs/common';
import { ObjectiveService } from './services/objective.service';
import { ObjectiveController } from './objective.controller';
import { PaginationModule } from '@root/src/core/pagination/pagination.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from './entities/objective.entity';
import { MilestonesModule } from '../milestones/milestones.module';
import { KeyResultsModule } from '../key-results/key-results.module';
import { HttpModule } from '@nestjs/axios';
import { AverageOkrRuleModule } from '../average-okr-rule/average-okr-rule.module';
import { GetFromOrganizatiAndEmployeInfoService } from './services/get-data-from-org.service';
import { AverageOkrCalculation } from './services/average-okr-calculation.service';
import { OKRDashboardService } from './services/okr-dashbord.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Objective]),
    PaginationModule,
    MilestonesModule,
    KeyResultsModule,
    AverageOkrRuleModule,
    HttpModule.register({}),
  ],
  controllers: [ObjectiveController],
  providers: [
    ObjectiveService,
    GetFromOrganizatiAndEmployeInfoService,
    AverageOkrCalculation,
    OKRDashboardService,
  ],
  exports: [ObjectiveService],
})
export class ObjectiveModule {}
