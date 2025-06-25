import { PartialType } from '@nestjs/mapped-types';
import { CreateMetricTypeDto } from './create-metric-type.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMetricTypeDto extends PartialType(CreateMetricTypeDto) {
  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
