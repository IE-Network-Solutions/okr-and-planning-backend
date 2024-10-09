import { Module } from '@nestjs/common';
import { OkrReportTaskController } from './okr-report-task.controller';
import { OkrReportTaskService } from './okr-report-task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportTask } from './entities/okr-report-task.entity';
import { Report } from '../okr-report/entities/okr-report.entity';
import { PlanTask } from '../plan-tasks/entities/plan-task.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { Plan } from '../plan/entities/plan.entity';
import { OkrReportService } from '../okr-report/okr-report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportTask,
      Report,
      PlanTask,
      PlanningPeriodUser,
      Plan,
    ]),
  ],
  controllers: [OkrReportTaskController],
  providers: [OkrReportTaskService, OkrReportService],
  exports: [OkrReportTaskService],
})
export class OkrReportTaskModule {}
