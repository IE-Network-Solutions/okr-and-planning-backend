import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Status } from '../enum/milestone.status.enum';
import { Type } from 'class-transformer';
import { Milestone } from '../entities/milestone.entity';

export class CreateMilestoneDto {
  @IsOptional()
  @IsString()
  keyResultId?: string;
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  status?: Status;
  @IsNumber()
  weight: number;
}
