import { Injectable } from '@nestjs/common';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  SoftRemoveEvent,
} from 'typeorm';
import { Repository } from 'typeorm';
import { KeyResult } from '../../key-results/entities/key-result.entity';
import { Milestone } from '../../milestones/entities/milestone.entity';
import { PlanTask } from '../../plan-tasks/entities/plan-task.entity';

@EventSubscriber()
@Injectable()
export class KeyResultsSubscriber
  implements EntitySubscriberInterface<KeyResult>
{
  listenTo() {
    return KeyResult;
  }
  async afterSoftRemove(event: SoftRemoveEvent<KeyResult>) {
    const milestoneRepository: Repository<Milestone> =
      event.connection.getRepository(Milestone);
    const planTaskRepository: Repository<PlanTask> =
      event.connection.getRepository(PlanTask);

    const milestones = await milestoneRepository.find({
      where: { keyResultId: event.entity.id },
    });

    const planTasks = await planTaskRepository.find({
      where: { keyResultId: event.entity.id },
    });

    if (planTasks.length > 0) {
      for (const planTask of planTasks) {
        await planTaskRepository.softRemove(planTask);
      }
    }

    if (milestones.length > 0) {
      for (const milestone of milestones) {
        await milestoneRepository.softRemove(milestone);
      }
    }
  }
}
