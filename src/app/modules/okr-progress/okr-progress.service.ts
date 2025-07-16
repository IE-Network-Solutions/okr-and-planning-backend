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
    isOnCreate: 'ON_CREATE' | 'ON_UPDATE' | 'ON_DELETE';
    actualValueToUpdate?: any;
  }): Promise<any> {
    const updateValue = new UpdateKeyResultDto();
    let shouldUpdateCurrentValue = true;
    try {
      const keyResults = await this.keyResultService.findOnekeyResult(
        keyResult.id,
      );

      if (keyResult.metricType.name === NAME.MILESTONE) {
        let keyResultProgress = 0;
        keyResults.milestones.forEach((milestone) => {
          if (milestone.status === Status.COMPLETED) {
            keyResultProgress += parseFloat(milestone.weight.toString());
          }
        });
        // Handle invalid progress
        if (!isFinite(keyResultProgress) || isNaN(keyResultProgress)) {
          keyResultProgress = 0;
        }
        updateValue.progress = keyResultProgress;
        shouldUpdateCurrentValue = false;
      } else if (keyResult.metricType.name === NAME.ACHIEVE) {
        let progress = parseFloat(keyResult.progress?.toString() || '0');
        if (!isFinite(progress) || isNaN(progress)) {
          progress = 0;
        }
        updateValue.progress = progress;
        shouldUpdateCurrentValue = false;
      } else {
        const previousValue = keyResults; // Already fetched above
        const keyResultCurrentValue = parseFloat(
          previousValue.currentValue?.toString() || '0',
        );
        let newValue = keyResultCurrentValue;

        if (actualValueToUpdate !== undefined) {
          const actual = parseFloat(keyResult.actualValue?.toString() || '0');
          const oldActual = parseFloat(actualValueToUpdate?.toString() || '0');

          const isFirstTime = keyResultCurrentValue === 0 && oldActual === 0;

          if (isFirstTime) {
            newValue = actual;
          } else {
            const diff = actual - oldActual;
            if (diff !== 0) {
              newValue = keyResultCurrentValue + diff;
            }
          }
        }

        const targetDifference =
          parseFloat(keyResult.targetValue?.toString() || '0') -
          parseFloat(keyResult.initialValue?.toString() || '0');
        let progress = 0;
        if (targetDifference !== 0 && isFinite(targetDifference)) {
          progress = (newValue / targetDifference) * 100;
        } else {
          progress = 0;
        }
        if (!isFinite(progress) || isNaN(progress)) {
          progress = 0;
        }
        if (!isFinite(newValue) || isNaN(newValue)) {
          shouldUpdateCurrentValue = false;
        }
        updateValue.progress = progress;
        if (shouldUpdateCurrentValue) {
          updateValue.currentValue = newValue;
        }
      }

      // **Update and Fetch Latest Key Result**
      await this.keyResultService.updatekeyResult(
        keyResult.id,
        updateValue,
        keyResult.tenantId,
      );
    } catch (error) {
      // On error, do not update currentValue, and set progress to 0
      updateValue.progress = 0;
      shouldUpdateCurrentValue = false;
      await this.keyResultService.updatekeyResult(
        keyResult.id,
        updateValue,
        keyResult.tenantId,
      );
    }
    // **Return the latest updated Key Result**
    return this.keyResultService.findOnekeyResult(keyResult.id);
  }
}
