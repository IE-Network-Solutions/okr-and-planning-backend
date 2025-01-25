import { Injectable } from '@nestjs/common';
import { Objective } from '../entities/objective.entity';
import { OkrProgressDto } from '../dto/okr-progress.dto';
import { JobInformationDto } from '../dto/job-information.dto';
import { AverageOkrRule } from '../../average-okr-rule/entities/average-okr-rule.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { GetFromOrganizatiAndEmployeInfoService } from './get-data-from-org.service';

@Injectable()
export class AverageOkrCalculation {
  async calculateAverageOkr(objectives: Objective[]): Promise<OkrProgressDto> {
    // const completedOkr = objectives.filter(
    //   (objective) =>
    //     objective['completedKeyResults'] === objective.keyResults.length,
    // ).length;
    const completedOkr = objectives.reduce((sum, objective) => {
      return sum + objective['completedKeyResults'];
    }, 0);
    const sumOfTeamObjectiveProgress = objectives.reduce((sum, objective) => {
      return sum + objective['objectiveProgress'];
    }, 0);

    const daysLeft = Math.max(...objectives.map((item) => item['daysLeft']));
    const calculatedOkr = new OkrProgressDto();
    calculatedOkr.daysLeft = daysLeft;
    (calculatedOkr.okr = objectives.length
      ? sumOfTeamObjectiveProgress / objectives.length
      : 0),
      (calculatedOkr.okrCompleted = completedOkr);
    calculatedOkr.keyResultcount = objectives.flatMap(
      (item) => item.keyResults,
    ).length;
    return calculatedOkr;
  }

  async calculateObjectiveProgress(
    objectives: Objective[],
  ): Promise<Objective[]> {
    return objectives.map((objective) => {
      let totalProgress = 0;
      let completedKeyResults = 0;

      const daysLeft = Math.ceil(
        (new Date(objective.deadline).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );

      objective.keyResults.forEach((keyResult) => {
        totalProgress += (keyResult.progress * keyResult.weight) / 100;
        if (parseFloat(keyResult.progress.toString()) === 100) {
          completedKeyResults = completedKeyResults + 1;
        }
      });

      return {
        ...objective,
        daysLeft,
        objectiveProgress: totalProgress,
        completedKeyResults: completedKeyResults,
      };
    });
  }
  async calculateObjectiveProgressForTeamLeads(
    objectives: Objective[],
  ): Promise<Objective[]> {
    return objectives.map((objective) => {
      let totalProgress = 0;
      let completedKeyResults = 0;

      const daysLeft = Math.ceil(
        (new Date(objective.deadline).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );

      objective.keyResults.forEach((keyResult) => {
        totalProgress += (keyResult.progress * keyResult.weight) / 100;

        if (keyResult.progress === 100) {
          completedKeyResults++;
        }
      });

      return {
        ...objective,
        daysLeft,
        objectiveProgress: totalProgress,
        completedKeyResults,
      };
    });
  }
}
