import { Type } from 'class-transformer';
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
  @IsOptional()
  @IsString()
  keyResultId?: string;
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
  @IsNumber()
  initialValue?: number;
  @IsOptional()
  @IsNumber()
  targetValue?: number;
  @IsNumber()
  weight: number;
  @IsOptional()
  @IsNumber()
  currentValue?: number;
  @IsOptional()
  @IsNumber()
  progress?: number;
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneDto)
  milestones?: CreateMilestoneDto[];
}
