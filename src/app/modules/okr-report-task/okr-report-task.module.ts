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
import { OkrProgressService } from '../okr-progress/okr-progress.service';
import { KeyResultsService } from '../key-results/key-results.service';
import { MetricTypesService } from '../metric-types/metric-types.service';
import { MilestonesService } from '../milestones/milestones.service';
import { KeyResult } from '../key-results/entities/key-result.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { MetricType } from '../metric-types/entities/metric-type.entity';
import { Milestone } from '../milestones/entities/milestone.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportTask,
      Report,
      PlanTask,
      PlanningPeriodUser,
      Plan,
      KeyResult,
      MetricType,
      Milestone
    ]),
  ],
  controllers: [OkrReportTaskController],
  providers: [
    OkrReportTaskService,
    OkrReportService,
    OkrProgressService,
    KeyResultsService,
    MetricTypesService,
    PaginationService,
    MilestonesService],
  exports: [OkrReportTaskService],
})
export class OkrReportTaskModule {}
