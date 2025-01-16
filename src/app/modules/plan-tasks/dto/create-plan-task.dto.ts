import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Priority } from '../entities/priority.enum';
import { Transform, Type } from 'class-transformer';

export class CreatePlanTaskDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  task: string;

  @IsOptional()
  @Transform(({ value }) => (value ? BigInt(value) : undefined))
  targetValue?: bigint;

  @IsEnum(Priority)
  priority: Priority;

  @IsString()
  userId: string;

  @IsString()
  planningPeriodId: string;

  @IsString()
  @IsOptional()
  planId: string | null;

  @IsString()
  @IsOptional()
  parentPlanId: string;

  @IsString()
  @IsOptional()
  parentTaskId?: string;

  @IsString()
  @IsNotEmpty()
  keyResultId: string;

  @IsString()
  planningUserId: string;

  @IsBoolean()
  @IsOptional()
  achieveMK: boolean;

  @IsString()
  @IsOptional()
  milestoneId?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
 @IsNumber({ maxDecimalPlaces: 2 })
@IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  sessionId?: string;
  // Recursive sub-tasks array
  @ValidateNested({ each: true }) // Validates each sub-task recursively
  @Type(() => CreatePlanTaskDto) // Specifies that the type of sub-task is also CreatePlanTaskDto
  @IsOptional() // Sub-tasks array is optional
  @IsArray() // Sub-tasks will be an array, even if empty
  subTasks?: CreatePlanTaskDto[];
}
