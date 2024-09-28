import { Injectable } from '@nestjs/common';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  SoftRemoveEvent,
} from 'typeorm';
import { Repository } from 'typeorm';
import { Objective } from '../entities/objective.entity';
import { KeyResult } from '../../key-results/entities/key-result.entity';

@EventSubscriber()
@Injectable()
export class ObjectiveSubscriber
  implements EntitySubscriberInterface<Objective>
{
  listenTo() {
    return Objective;
  }
  async afterSoftRemove(event: SoftRemoveEvent<Objective>) {
    const keyResultRepository: Repository<KeyResult> =
      event.connection.getRepository(KeyResult);
    const keyResults = await keyResultRepository.find({
      where: { objectiveId: event.entity.id },
    });
    for (const keyResult of keyResults) {
      await keyResultRepository.softRemove(keyResult);
    }
  }
}
