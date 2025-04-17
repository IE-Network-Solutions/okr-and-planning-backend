import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateMilestoneDto } from '../../milestones/dto/create-milestone.dto';

export class CreateKeyResultDto {
  @IsOptional()
  @IsString()
  objectiveId?: string;
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description: string;
  @IsDateString()
  deadline: Date;
  @IsOptional()
  @IsString()
  metricTypeId?: string;
  @IsOptional()
  @IsString()
  sessionId?: string;
  @IsOptional()
  @Transform(({ value }) => value === null ? null : parseFloat(value))

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNumber()
  initialValue?: number;
  @IsOptional()
  @Transform(({ value }) => value === null ? null : parseFloat(value))

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNumber()
  targetValue?: number;
  @Transform(({ value }) => value === null ? null : parseFloat(value))

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNumber()
  weight: number;
  @IsOptional()
  @Transform(({ value }) => value === null ? null : parseFloat(value))

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNumber()
  currentValue?: number;
  @IsOptional()
  @Transform(({ value }) => value === null ? null : parseFloat(value))

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNumber()
  progress?: number;
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneDto)
  milestones?: CreateMilestoneDto[];
}
