import { IsArray, ValidateNested } from 'class-validator';
import { CreatePlanTaskDto } from './create-plan-task.dto';
import { Type } from 'class-transformer';

export class CreatePlanTasksDto {
  @IsArray() // Ensure it is an array
  @ValidateNested({ each: true }) // Validate each item in the array
  @Type(() => CreatePlanTaskDto) // Transform each item into CreatePlanTaskDto
  tasks: CreatePlanTaskDto[];
}
