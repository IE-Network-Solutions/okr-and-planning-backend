import { IsString } from 'class-validator';
import { NAME } from '../enum/metric-type.enum';

export class CreateMetricTypeDto {
  @IsString()
  name: NAME;
  @IsString()
  description: string;
}
