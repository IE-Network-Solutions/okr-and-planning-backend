import { Injectable } from '@nestjs/common';
import { EntitySubscriberInterface, EventSubscriber, Repository, SoftRemoveEvent } from 'typeorm';
import { PlanTask } from '../entities/plan-task.entity';
import { ReportTask } from '../../okr-report-task/entities/okr-report-task.entity';


@EventSubscriber()
@Injectable()
export class PlanTaskSubscriber
  implements EntitySubscriberInterface<PlanTask>
{
  listenTo() {
    return PlanTask;
  }
  async afterSoftRemove(event: SoftRemoveEvent<PlanTask>) {
    const ReportTaskRepository: Repository<ReportTask> =
      event.connection.getRepository(ReportTask);
    const ReportTasks = await ReportTaskRepository.findOne({
      where: { planTaskId: event.entity.id },
    });
    await ReportTaskRepository.softRemove(ReportTasks);
  }
}