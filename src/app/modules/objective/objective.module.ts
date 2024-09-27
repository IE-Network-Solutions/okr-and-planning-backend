import { Module } from '@nestjs/common';
import { ObjectiveService } from './objective.service';
import { ObjectiveController } from './objective.controller';
import { PaginationModule } from '@root/src/core/pagination/pagination.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from './entities/objective.entity';
import { MilestonesModule } from '../milestones/milestones.module';
import { KeyResultsModule } from '../key-results/key-results.module';
import { HttpModule } from '@nestjs/axios';
import { AverageOkrRuleModule } from '../average-okr-rule/average-okr-rule.module';

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
  providers: [ObjectiveService],
  exports: [ObjectiveService],
})
export class ObjectiveModule { }
