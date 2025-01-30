import { Injectable } from '@nestjs/common';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  SoftRemoveEvent,
} from 'typeorm';
import { Repository } from 'typeorm';
import { Milestone } from '../../milestones/entities/milestone.entity';
import { PlanTask } from '../../plan-tasks/entities/plan-task.entity';

@EventSubscriber()
@Injectable()
export class MilestoneSubscriber
  implements EntitySubscriberInterface<Milestone>
{
  listenTo() {
    return Milestone;
  }
  async afterSoftRemove(event: SoftRemoveEvent<Milestone>) {

    const planTaskRepository: Repository<PlanTask> =
      event.connection.getRepository(PlanTask);

    const planTasks = await planTaskRepository.find({
      where: { milestoneId: event.entity.id },
    });

    for (const planTask of planTasks) {
      await planTaskRepository.softRemove(planTask);
    }
  }
}
