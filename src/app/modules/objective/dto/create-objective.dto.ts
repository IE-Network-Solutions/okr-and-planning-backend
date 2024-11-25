import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
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
  @IsOptional()
  @IsString()
  objectiveId?: string;
  @IsDateString()
  deadline: Date;
  @IsOptional()
  @IsString()
  allignedKeyResultId?: string;
  @ValidateNested({ each: true })
  @Type(() => CreateKeyResultDto)
  keyResults: CreateKeyResultDto[];
}
