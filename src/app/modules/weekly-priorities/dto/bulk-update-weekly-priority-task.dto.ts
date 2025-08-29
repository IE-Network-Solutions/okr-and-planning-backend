// object of new and remove. new implies create and remove implies delete.

import { IsArray, IsObject } from 'class-validator';
import { CreateWeeklyPriorityDto } from './create-weekly-priority-task.dto';

export class BulkUpdateWeeklyPriorityDto {
  @IsArray()
  @IsObject({ each: true })
  new: CreateWeeklyPriorityDto[];

  @IsArray()
  @IsObject({ each: true })
  remove: CreateWeeklyPriorityDto[];
}
