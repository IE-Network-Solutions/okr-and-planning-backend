import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Priority } from '../entities/priority.enum';
import { Type } from 'class-transformer';

export class CreatePlanTaskDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  task: string;

  @IsInt()
  @IsOptional()
  targetValue?: number;

  @IsEnum(Priority)
  priority: Priority;

  @IsString()
  userId: string;

  @IsString()
  planningPeriodId: string;

  @IsString()
  @IsOptional()
  planId: string;

  @IsString()
  @IsOptional()
  parentPlanId: string;

  @IsString()
  @IsOptional()
  parentTaskId?: string;

  @IsString()
  keyResultId: string;

  @IsString()
  planningUserId: string;

  @IsString()
  @IsOptional()
  milestoneId?: string;

  @IsInt()
  @IsOptional()
  weight: number;

  // Recursive sub-tasks array
  @ValidateNested({ each: true }) // Validates each sub-task recursively
  @Type(() => CreatePlanTaskDto) // Specifies that the type of sub-task is also CreatePlanTaskDto
  @IsOptional() // Sub-tasks array is optional
  @IsArray() // Sub-tasks will be an array, even if empty
  subTasks?: CreatePlanTaskDto[];
}
