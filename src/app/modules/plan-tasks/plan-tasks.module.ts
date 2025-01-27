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
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanTask, Plan, PlanningPeriodUser]),
    KeyResultsModule,
    MilestonesModule,
    HttpModule,
  ],
  controllers: [PlanTasksController],
  providers: [
    PlanTasksService,
    PaginationService,
    GetFromOrganizatiAndEmployeInfoService,
  ],
})
export class PlanTasksModule {}
