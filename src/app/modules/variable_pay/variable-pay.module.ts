import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CriteriaTargetController } from './controllers/criteria-target.controller';
import { CriteriaTargetService } from './services/criteria-target.service';
import { UserVpScoringController } from './controllers/user-vp-scoring.controller';
import { VpCriteriaController } from './controllers/vp-criteria.controller';
import { VpScoreInstanceController } from './controllers/vp-score-instance.controller';
import { VpScoringController } from './controllers/vp-scoring.controller';
import { VpScoringCriteriaController } from './controllers/vp-scoring-criteria.controller';
import { UserVpScoringService } from './services/user-vp-scoring.service';
import { VpCriteriaService } from './services/vp-criteria.service';
import { VpScoreInstanceService } from './services/vp-score-instance.service';
import { VpScoringService } from './services/vp-scoring.service';
import { CriteriaTarget } from './entities/criteria-target.entity';
import { UserVpScoring } from './entities/user-vp-scoring.entity';
import { VpScoreInstance } from './entities/vp-score-instance.entity';
import { VpScoringCriterion } from './entities/vp-scoring-criterion.entity';
import { VpScoring } from './entities/vp-scoring.entity';
import { VpCriteria } from './entities/vp-criteria.entity';
import { PaginationModule } from '@root/src/core/pagination/pagination.module';
import { VpScoringCriteriaService } from './services/vp-scoring-criteria.service';
import { HttpModule } from '@nestjs/axios';
import { ObjectiveModule } from '../objective/objective.module';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VpCriteria,
      VpScoring,
      VpScoringCriterion,
      VpScoreInstance,
      UserVpScoring,
      CriteriaTarget,
    ]),
    PaginationModule,
    HttpModule.register({}),
    ObjectiveModule,
  ],
  controllers: [
    CriteriaTargetController,
    UserVpScoringController,
    VpCriteriaController,
    VpScoreInstanceController,
    VpScoringController,
    VpScoringCriteriaController,
  ],
  providers: [
    CriteriaTargetService,
    UserVpScoringService,
    VpCriteriaService,
    VpScoreInstanceService,
    VpScoringService,
    VpScoringCriteriaService,
    GetFromOrganizatiAndEmployeInfoService,
  ],
  exports: [
    CriteriaTargetService,
    UserVpScoringService,
    VpCriteriaService,
    VpScoreInstanceService,
    VpScoringService,
    VpScoringCriteriaService,
  ],
})
export class VariablePayModule {}
