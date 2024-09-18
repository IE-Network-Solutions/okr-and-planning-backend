import { Module } from '@nestjs/common';
import { PlanTasksService } from './plan-tasks.service';
import { PlanTasksController } from './plan-tasks.controller';

@Module({
  controllers: [PlanTasksController],
  providers: [PlanTasksService],
})
export class PlanTasksModule {}
