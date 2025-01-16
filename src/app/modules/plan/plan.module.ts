import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { Plan } from './entities/plan.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { GetFromOrganizatiAndEmployeInfoService } from '../objective/services/get-data-from-org.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, PlanningPeriodUser, PlanTask]),
    ConfigModule,
    HttpModule,
  ],
  controllers: [PlanController],
  providers: [
    PlanService,
    PaginationService,
    GetFromOrganizatiAndEmployeInfoService,
  ],
  exports:[PlanService]
})
export class PlanModule {}
