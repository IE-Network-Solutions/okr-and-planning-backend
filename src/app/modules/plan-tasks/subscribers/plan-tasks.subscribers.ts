import { Injectable } from '@nestjs/common';
import { EntitySubscriberInterface, EventSubscriber, Repository, SoftRemoveEvent } from 'typeorm';
import { PlanTask } from '../entities/plan-task.entity';
import { ReportTask } from '../../okr-report-task/entities/okr-report-task.entity';
import { OkrReportTaskService } from '../../okr-report-task/okr-report-task.service';


@EventSubscriber()
@Injectable()
export class PlanTaskSubscriber
  implements EntitySubscriberInterface<PlanTask>
{
  constructor(private readonly okrReportTaskService: OkrReportTaskService) {}  // Injecting the service

  listenTo() {
    return PlanTask;
  }
  async afterSoftRemove(event: SoftRemoveEvent<PlanTask>) {
    const ReportTaskRepository: Repository<ReportTask> =
      event.connection.getRepository(ReportTask);
    const reportTasks = await ReportTaskRepository.findOne({
      where: { planTaskId: event.entity.id },
    });

    if (reportTasks && Object.keys(reportTasks).length > 0) {
      await this.okrReportTaskService.checkAndUpdateProgressByKey([reportTasks],'ON_DELETE')
      await ReportTaskRepository.softRemove(reportTasks);
    }

  }
}