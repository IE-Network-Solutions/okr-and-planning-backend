import { Injectable } from '@nestjs/common';
import { CreateOkrProgressDto } from './dto/create-okr-progress.dto';
import { UpdateOkrProgressDto } from './dto/update-okr-progress.dto';
import { Objective } from '../objective/entities/objective.entity';
import { KeyResult } from '../key-results/entities/key-result.entity';
import { NAME } from '../metric-types/enum/metric-type.enum';
import { Status } from '../milestones/enum/milestone.status.enum';

@Injectable()
export class OkrProgressService {
  async calculateKeyResultProgress(keyResult: KeyResult) {

    if (keyResult.metricType.name === NAME.MILESTONE) {
      let keyResultProgress = 0
      keyResult.milestones.forEach((milestone) => {
        if (milestone.status === Status.COMPLETED) {
          keyResultProgress += milestone.weight;
        }
      });
      keyResult.progress = keyResultProgress
    }
    else if (keyResult.metricType.name === NAME.ACHIEVE) {
      keyResult.progress = keyResult.progress;
    }
    else {
      const initialDifference = keyResult.currentValue - keyResult.initialValue;
      const targetDifference = keyResult.currentValue - keyResult.initialValue;
      let progress = (initialDifference / targetDifference) * 100;
      keyResult.progress = progress
    }
    return keyResult

  }


}
