import { Injectable } from '@nestjs/common';
import {
    EventSubscriber,
    EntitySubscriberInterface,
    SoftRemoveEvent,
} from 'typeorm';
import { Repository } from 'typeorm';
import { KeyResult } from '../../key-results/entities/key-result.entity';
import { Milestone } from '../../milestones/entities/milestone.entity';

@EventSubscriber()
@Injectable()
export class KeyResultsSubscriber
    implements EntitySubscriberInterface<KeyResult> {
    listenTo() {
        return KeyResult;
    }
    async afterSoftRemove(event: SoftRemoveEvent<KeyResult>) {
        const milestoneRepository: Repository<Milestone> =
            event.connection.getRepository(Milestone);
        const milestones = await milestoneRepository.find({
            where: { keyResultId: event.entity.id },
        });
        for (const milestone of milestones) {
            await milestoneRepository.softRemove(milestone);
        }
    }


}
