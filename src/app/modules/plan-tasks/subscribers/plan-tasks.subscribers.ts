import { Injectable } from '@nestjs/common';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  Repository,
  SoftRemoveEvent,
} from 'typeorm';
import { PlanTask } from '../entities/plan-task.entity';
import { ReportTask } from '../../okr-report-task/entities/okr-report-task.entity';
import { OkrReportTaskService } from '../../okr-report-task/okr-report-task.service';

@EventSubscriber()
@Injectable()
export class PlanTaskSubscriber implements EntitySubscriberInterface<PlanTask> {
  constructor(private readonly okrReportTaskService: OkrReportTaskService) {} // Injecting the service


  listenTo() {
    return PlanTask;
  }

  async afterSoftRemove(event: SoftRemoveEvent<PlanTask>): Promise<void> {
    const reportTaskRepository: Repository<ReportTask> =
      event.connection.getRepository(ReportTask);

    const reportTasks = await reportTaskRepository.find({
      where: { planTaskId: event.entity.id },
    });

    if (reportTasks.length === 0) {
      return;
    }

    await this.okrReportTaskService.checkAndUpdateProgressByKey(
      reportTasks,
      'ON_DELETE',
    );
    await reportTaskRepository.softRemove(reportTasks);
    
  }
}