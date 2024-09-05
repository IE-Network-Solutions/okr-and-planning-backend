import { Module } from '@nestjs/common';
import { PlanningPeriodsController } from './planning-periods.controller';
import { PlanningPeriodsService } from './planning-periods.service';

@Module({
  controllers: [PlanningPeriodsController],
  providers: [PlanningPeriodsService],
})
export class PlanningPeriodsModule {}
