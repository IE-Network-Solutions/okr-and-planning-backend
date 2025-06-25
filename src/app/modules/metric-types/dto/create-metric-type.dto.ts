import { IsString, IsOptional } from 'class-validator';
import { NAME } from '../enum/metric-type.enum';

export class CreateMetricTypeDto {
  @IsString()
  name: NAME;
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
