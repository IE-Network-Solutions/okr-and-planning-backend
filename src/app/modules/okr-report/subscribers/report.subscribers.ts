import { Injectable } from '@nestjs/common';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  SoftRemoveEvent,
} from 'typeorm';
import { Report } from '../entities/okr-report.entity';
import { ReportTask } from '../../okr-report-task/entities/okr-report-task.entity';

@EventSubscriber()
@Injectable()
export class ReportSubscriber implements EntitySubscriberInterface<Report> {
  listenTo() {
    return Report;
  }

  async afterSoftRemove(event: SoftRemoveEvent<Report>) {
    const reportTaskRepository = event.connection.getRepository(ReportTask);

    try {
      const reportTasks = await reportTaskRepository.find({
        where: { reportId: event.entity.id },
      });

      if (reportTasks.length > 0) {
        await reportTaskRepository.softRemove(reportTasks);
      }
    } catch (error) {
      return error;
    }
  }
}
