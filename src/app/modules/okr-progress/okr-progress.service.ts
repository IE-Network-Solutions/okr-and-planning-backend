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

      updateValue.progress = keyResultProgress;
    } else if (keyResult.metricType.name === NAME.ACHIEVE) {
      updateValue.progress = parseFloat(keyResult.progress.toString());
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
        parseFloat(keyResult.targetValue.toString()) -
        parseFloat(keyResult.initialValue.toString());
      let progress = (newValue / targetDifference) * 100;

      if (progress > 100) {
        progress = 100;
      } else if (progress < 0) {
        progress = 0;
      }

      updateValue.progress = progress;
      updateValue.currentValue = newValue;
    }

    // **Update and Fetch Latest Key Result**
    await this.keyResultService.updatekeyResult(
      keyResult.id,
      updateValue,
      keyResult.tenantId,
    );

    // **Return the latest updated Key Result**
    return this.keyResultService.findOnekeyResult(keyResult.id);
  }
}
