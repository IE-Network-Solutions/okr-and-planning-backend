import { Module } from '@nestjs/common';
import { WeeklyPrioritiesService } from './weekly-priorities-task.service';
import { WeeklyPrioritiesController } from './weekly-priorities-task.controller';
import { PaginationModule } from '@root/src/core/pagination/pagination.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklyPriorityTask } from './entities/weekly-priority-task.entity';
import { WeeklyPrioritiesWeekController } from './weekly-priorities-week.controller';
import { WeeklyPrioritiesWeekService } from './weekly-priorities-week.service';
import { WeeklyPriorityWeek } from './entities/weekly-priority-week.entity';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [TypeOrmModule.forFeature([WeeklyPriorityTask,WeeklyPriorityWeek]), PaginationModule,ScheduleModule.forRoot(),],
  controllers: [WeeklyPrioritiesController,WeeklyPrioritiesWeekController],
  providers: [WeeklyPrioritiesService,WeeklyPrioritiesWeekService,CronService],
})
export class WeeklyPrioritiesModule {}
