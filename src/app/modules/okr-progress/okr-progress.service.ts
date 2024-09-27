import { Injectable } from '@nestjs/common';
import { CreateOkrProgressDto } from './dto/create-okr-progress.dto';
import { UpdateOkrProgressDto } from './dto/update-okr-progress.dto';

@Injectable()
export class OkrProgressService {
  create(createOkrProgressDto: CreateOkrProgressDto) {

    // if (keyResult.metricType.name === NAME.MILESTONE) {
    //   // Calculate progress based on completed milestones
    //   keyResult.milestones.forEach((milestone) => {
    //     if (milestone.status === Status.COMPLETED) {
    //       keyResultProgress += milestone.weight;
    //     }
    //   });
    // } else if (keyResult.metricType.name === NAME.ACHIEVE) {
    //   // Directly use key result progress for ACHIEVE type
    //   keyResultProgress = keyResult.progress;
    // } else {
    //   // Calculate percentage for other metric types
    //   const difference = keyResult.targetValue - keyResult.currentValue;
    //   keyResultProgress = ((difference * 100) / keyResult.targetValue);
    // }

    // // Add the progress for the current key result
    // totalProgress += keyResultProgress;

    // // Check if key result is completed
    // if (keyResultProgress >= 100) {
    //   completedKeyResults++;
    // }




  }

  findAll() {
    return `This action returns all okrProgress`;
  }

  findOne(id: number) {
    return `This action returns a #${id} okrProgress`;
  }

  update(id: number, updateOkrProgressDto: UpdateOkrProgressDto) {
    return `This action updates a #${id} okrProgress`;
  }

  remove(id: number) {
    return `This action removes a #${id} okrProgress`;
  }
}
