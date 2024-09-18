import {
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Milestone } from '../../milestones/entities/milestone.entity';
import { KeyResult } from '../../key-results/entities/key-result.entity';
import { Type } from 'class-transformer';
import { CreateKeyResultDto } from '../../key-results/dto/create-key-result.dto';

export class CreateObjectiveDto {
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsString()
  userId: string;
  @IsDateString()
  deadline: Date;
  @IsOptional()
  @IsString()
  allignedKeyResultId?: string;
  @ValidateNested({ each: true })
  @Type(() => CreateKeyResultDto)
  keyResult: CreateKeyResultDto[];
}
