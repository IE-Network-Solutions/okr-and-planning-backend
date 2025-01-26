import { Injectable } from '@nestjs/common';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  SoftRemoveEvent,
} from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { Report } from '../../okr-report/entities/okr-report.entity';
import { PlanTask } from '../../plan-tasks/entities/plan-task.entity';

@EventSubscriber()
@Injectable()
export class PlanSubscriber implements EntitySubscriberInterface<Plan> {
  listenTo() {
    return Plan;
  }

  async afterSoftRemove(event: SoftRemoveEvent<Plan>) {

    const reportRepository = event.connection.getRepository(Report);
    const planTaskRepository = event.connection.getRepository(PlanTask);

    try {
      const reports = await reportRepository.find({
        where: { planId: event.entity.id },
      });
      const planTasks = await planTaskRepository.find({
        where: { planId: event.entity.id },
      });

      if (planTasks.length > 0) {
        await planTaskRepository.softRemove(planTasks);
      }
      if (reports.length > 0) {
        await reportRepository.softRemove(reports);
      }
    } catch (error) {
      return error;
    }
  }
}
