import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { Plan } from './entities/plan.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, PlanningPeriodUser, PlanTask])],
  controllers: [PlanController],
  providers: [PlanService, PaginationService],
})
export class PlanModule {}
