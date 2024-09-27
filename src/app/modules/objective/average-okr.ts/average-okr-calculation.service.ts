import { Injectable } from "@nestjs/common";
import { Objective } from "../entities/objective.entity";
import { OkrProgressDto } from "../dto/okr-progress.dto";

@Injectable()
export class AverageOkrCalculation {
  async calculateObjectiveProgress(objectives: Objective[]): Promise<Objective[]> {
    console.log(objectives.length, "length")

    return objectives.map((objective) => {
      let totalProgress = 0;
      let completedKeyResults = 0;

      const daysLeft = Math.ceil(
        (new Date(objective.deadline).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
      );

      objective.keyResults.forEach((keyResult) => {
        console.log(keyResult.progress * keyResult.weight / 100, "each")
        totalProgress += (keyResult.progress * keyResult.weight) / 100;

        if (keyResult.progress === 100) {
          console.log(keyResult.progress, "(keyResult.progress")
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



  async calculateAverageOkr(objectives: Objective[]): Promise<OkrProgressDto> {
    const completedOkr = objectives.filter(objective =>
      objective['completedKeyResults'] === objective.keyResults.length
    ).length;

    const sumOfTeamObjectiveProgress = objectives.reduce((sum, objective) => {
      console.log(objective['objectiveProgress'], "individualObjectives");
      return sum + objective['objectiveProgress'];
    }, 0);

    const daysLeft = Math.max(...objectives.map(item => item['daysLeft']));

    let calculatedOkr = new OkrProgressDto
    calculatedOkr.daysLeft = daysLeft
    calculatedOkr.okr = objectives.length ? sumOfTeamObjectiveProgress / objectives.length : 0,
      calculatedOkr.okrCompleted = completedOkr
    return calculatedOkr
  }






}