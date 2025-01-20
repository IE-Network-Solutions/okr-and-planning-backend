import { Injectable } from '@nestjs/common';
import { CreateOkrProgressDto } from './dto/create-okr-progress.dto';
import { UpdateOkrProgressDto } from './dto/update-okr-progress.dto';
import { Objective } from '../objective/entities/objective.entity';
import { KeyResult } from '../key-results/entities/key-result.entity';
import { NAME } from '../metric-types/enum/metric-type.enum';
import { Status } from '../milestones/enum/milestone.status.enum';
import { KeyResultsService } from '../key-results/key-results.service';
import { UpdateKeyResultDto } from '../key-results/dto/update-key-result.dto';
import { MetricTypesService } from '../metric-types/metric-types.service';
import { MilestonesService } from '../milestones/milestones.service';
import { Milestone } from '../milestones/entities/milestone.entity';
import { updateMilestoneData } from '../milestones/test/milestone.data';
interface KeyResultWithActualValue extends KeyResult {
  actualValue?: any; // Add actualValue as an optional property
}
@Injectable()
export class OkrProgressService {
  constructor(
    private readonly keyResultService: KeyResultsService,
    private readonly metricTypesService: MetricTypesService,
    private readonly milestonesService: MilestonesService,
  ) {}

  async calculateKeyResultProgress({
    keyResult,
    isOnCreate,
    actualValueToUpdate,
  }: {
    keyResult: KeyResultWithActualValue;
    isOnCreate: boolean;
    actualValueToUpdate?: any;
  }): Promise<any> {
    const updateValue = new UpdateKeyResultDto();
    const keyResults = await this.keyResultService.findOnekeyResult(
      keyResult.id,
    );
    if (keyResult.metricType.name === NAME.MILESTONE) {
      let keyResultProgress = 0;
      keyResults.milestones.forEach((milestone) => {
        if (milestone.status === Status.COMPLETED) {
          keyResultProgress += milestone.weight;
        }
      });

      updateValue.progress = keyResultProgress;
    } else if (keyResult.metricType.name === NAME.ACHIEVE) {
      updateValue.progress = keyResult.progress;
    } else {
      const previousValue = await this.keyResultService.findOnekeyResult(
        keyResult.id,
      );
      const previousCurrentValue = isOnCreate
        ? previousValue.currentValue
        : previousValue.currentValue - actualValueToUpdate; //  previousValue.lastUpdateValue;
      const currentValue = previousCurrentValue + keyResult['actualValue'];
      const initialDifference = currentValue - keyResult.initialValue;
      const targetDifference = keyResult.targetValue - keyResult.initialValue;
      const progress = (initialDifference / targetDifference) * 100;

      updateValue.progress = progress;
      // updateValue['lastUpdateValue'] = keyResult.currentValue;
      updateValue.currentValue = currentValue;
      keyResult.progress = progress;
    }

    const finalUpdate = await this.keyResultService.updatekeyResult(
      keyResult.id,
      updateValue,
      keyResult.tenantId,
    );
    return finalUpdate;
  }
}

//do we allow users to excide target value?
//get current key resukt value then on create add to current value  here save the cureent value as the last update value
//else on update subtract current value and last update value saved  then add the new current value
// if (keyResult.metricType.name === NAME.MILESTONE) {
//   let keyResultProgress = 0
//   keyResult.milestones.forEach((milestone) => {
//     if (milestone.status === Status.COMPLETED) {
//       keyResultProgress += milestone.weight;
//     }
//   });
//   keyResult.progress = keyResultProgress
// }
// else if (keyResult.metricType.name === NAME.ACHIEVE) {
//   keyResult.progress = keyResult.progress;
// }
// else {
//   const previousValue = await this.keyResultService.findOnekeyResult(keyResult.id)

//   if (isOncreate === true) {

//     let currentValue = previousValue.currentValue + keyResult.currentValue
//     previousValue.lastUpdateValue = keyResult.currentValue
//     const initialDifference = currentValue - keyResult.initialValue;
//     const targetDifference = keyResult.targetValue - keyResult.initialValue;
//     let progress = (initialDifference / targetDifference) * 100;
//     let updateValue = new UpdateKeyResultDto
//     updateValue.progress = progress
//     updateValue['lastUpdateValue'] = keyResult.currentValue
//     const finalUpdate = await this.keyResultService.updatekeyResult(keyResult.id, updateValue, keyResult.tenantId)

//     keyResult.progress = progress
//     return finalUpdate

//   }
//   else {
//     let previousCurrentValue = previousValue.currentValue - previousValue.lastUpdateValue
//     previousValue.lastUpdateValue = keyResult.currentValue
//     let currentValue = previousCurrentValue + keyResult.currentValue
//     const initialDifference = currentValue - keyResult.initialValue;
//     const targetDifference = keyResult.targetValue - keyResult.initialValue;
//     let progress = (initialDifference / targetDifference) * 100;
//     let updateValue = new UpdateKeyResultDto

//     updateValue.progress = progress
//     updateValue['lastUpdateValue'] = keyResult.currentValue
//     const finalUpdate = await this.keyResultService.updatekeyResult(keyResult.id, updateValue, keyResult.tenantId)

//     keyResult.progress = progress
//     return finalUpdate

//   }

// }
