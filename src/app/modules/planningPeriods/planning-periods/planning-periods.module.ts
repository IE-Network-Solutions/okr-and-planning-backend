import { Module } from '@nestjs/common';
import { PlanningPeriodsController } from './planning-periods.controller';
import { PlanningPeriodsService } from './planning-periods.service';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PlanningPeriod } from './entities/planningPeriod.entity';
import { PlanningPeriodUser } from './entities/planningPeriodUser.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanModule } from '../../plan/plan.module';
import { GetFromOrganizatiAndEmployeInfoService } from '../../objective/services/get-data-from-org.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanningPeriod, PlanningPeriodUser]),
    PlanModule,
    HttpModule,
  ],
  controllers: [PlanningPeriodsController],
  providers: [
    PlanningPeriodsService,
    PaginationService,
    GetFromOrganizatiAndEmployeInfoService,
  ],
  exports: [PlanningPeriodsService],
})
export class PlanningPeriodsModule {}
