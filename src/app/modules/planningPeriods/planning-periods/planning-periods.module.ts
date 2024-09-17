import { Module } from '@nestjs/common';
import { PlanningPeriodsController } from './planning-periods.controller';
import { PlanningPeriodsService } from './planning-periods.service';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PlanningPeriod } from './entities/planningPeriod.entity';
import { PlanningPeriodUser } from './entities/planningPeriodUser.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PlanningPeriod, PlanningPeriodUser])],
  controllers: [PlanningPeriodsController],
  providers: [PlanningPeriodsService, PaginationService],
})
export class PlanningPeriodsModule {}
