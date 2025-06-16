import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateWeeklyPriorityDto } from './create-weekly-priority-task.dto';

export class BulkCreateWeeklyPriorityDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateWeeklyPriorityDto)
  tasks: CreateWeeklyPriorityDto[];
}
