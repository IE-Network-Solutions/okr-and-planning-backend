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

    try {
      const keyResults = await this.keyResultService.findOnekeyResult(
        keyResult.id,
      );
      // Initialize updateValue with the current values from keyResults
      const updateValue = new UpdateKeyResultDto();
      Object.assign(updateValue, keyResults);
      
      let shouldUpdateCurrentValue = true;

      if (keyResult.metricType.name === NAME.MILESTONE) {
        let keyResultProgress = 0;
        keyResults.milestones.forEach((milestone) => {
          if (milestone.status === Status.COMPLETED) {
            keyResultProgress += parseFloat(milestone.weight.toString());
          }
        });
        if (!Number.isFinite(keyResultProgress) || isNaN(keyResultProgress)) {
          keyResultProgress = 0;
          shouldUpdateCurrentValue = false;
        }
        updateValue.progress = keyResultProgress;
      } else if (keyResult.metricType.name === NAME.ACHIEVE) {
        let progress = parseFloat(keyResult.progress?.toString() || '0');
        if (!Number.isFinite(progress) || isNaN(progress)) {
          progress = 0;
          shouldUpdateCurrentValue = false;
        }
        updateValue.progress = progress;
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
        if (targetDifference !== 0 && Number.isFinite(targetDifference)) {
          progress = (newValue / targetDifference) * 100;
        } else {
          progress = 0;
        }
        if (!Number.isFinite(progress) || isNaN(progress)) {
          progress = 0;
          shouldUpdateCurrentValue = false;
        }

        updateValue.progress = progress;
        if (shouldUpdateCurrentValue) {
          updateValue.currentValue = newValue;
        }
      }


      // **Update and Fetch Latest Key Result**
     const respnseData= await this.keyResultService.updatekeyResult(
        keyResult.id,
        updateValue,
        keyResult.tenantId,
      );

      return respnseData;
    } catch (error) {
      // Ensure updateValue is defined in this scope
      const updateValue = new UpdateKeyResultDto();
      // On error, do not update currentValue, and set progress to 0
      updateValue.progress = 0;
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
