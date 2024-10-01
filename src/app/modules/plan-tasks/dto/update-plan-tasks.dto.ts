import { Type } from 'class-transformer';
import { CreatePlanTaskDto } from './create-plan-task.dto';
import { IsArray, ValidateNested } from 'class-validator';

export class UpdatePlanTasksDto {
  @IsArray() // Ensure it is an array
  @ValidateNested({ each: true }) // Validate each item in the array
  @Type(() => CreatePlanTaskDto) // Transform each item into CreatePlanTaskDto
  tasks: CreatePlanTaskDto[];
}
