import { Module } from '@nestjs/common';
import { OkrReportTaskController } from './okr-report-task.controller';
import { OkrReportTaskService } from './okr-report-task.service';

@Module({
  controllers: [OkrReportTaskController],
  providers: [OkrReportTaskService]
})
export class OkrReportTaskModule {}
