import { Module } from '@nestjs/common';
import { PlanTasksService } from './plan-tasks.service';
import { PlanTasksController } from './plan-tasks.controller';
import { PlanTask } from './entities/plan-task.entity';
import { Plan } from '../plan/entities/plan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { KeyResultsModule } from '../key-results/key-results.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanTask, Plan, PlanningPeriodUser]),
    KeyResultsModule,
    MilestonesModule,
  ],
  controllers: [PlanTasksController],
  providers: [PlanTasksService, PaginationService],
})
export class PlanTasksModule {}
