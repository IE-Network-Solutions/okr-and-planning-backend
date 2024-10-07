import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CreateKeyResultDto } from '../../key-results/dto/create-key-result.dto';
import { Type } from 'class-transformer';

export class CreateOkrProgressDto {
  @Type(() => CreateKeyResultDto)
  keyResult: CreateKeyResultDto;
  @IsString()
  currentValue: string;
  @IsOptional()
  @IsString()
  updateValue?: string;
  @IsBoolean()
  isOnCreate: boolean;
  @IsString()
  metricTypeId?: string;
  @IsOptional()
  @IsString()
  achivedMilestoneId?: string;
}
