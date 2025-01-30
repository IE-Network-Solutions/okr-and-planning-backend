import { Injectable } from '@nestjs/common';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  SoftRemoveEvent,
} from 'typeorm';
import { Report } from '../entities/okr-report.entity';
import { ReportTask } from '../../okr-report-task/entities/okr-report-task.entity';
import { OkrReportTaskService } from '../../okr-report-task/okr-report-task.service';

@EventSubscriber()
@Injectable()
export class ReportSubscriber implements EntitySubscriberInterface<Report> {
  constructor(private readonly okrReportTaskService: OkrReportTaskService) {}

  listenTo() {
    return Report;
  }

  async afterSoftRemove(event: SoftRemoveEvent<Report>) {
    if (!event.entity || !event.entity.id) return; // Ensure entity exists before proceeding

    try {
      const reportTasks = await event.manager.find(ReportTask, {
        where: { reportId: event.entity.id },
      });

      if (reportTasks.length > 0) {
        // const check =
        //   await this.okrReportTaskService.checkAndUpdateProgressByKey(
        //     reportTasks,
        //     'ON_DELETE',
        //   );

        // if (check.length > 0) {
        await event.manager.softRemove(reportTasks);
        // }
      }
    } catch (error) {
      return error;
    }
  }
}
