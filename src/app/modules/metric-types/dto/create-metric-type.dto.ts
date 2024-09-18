import { IsString } from 'class-validator';

export class CreateMetricTypeDto {
  @IsString()
  name: string;
  @IsString()
  description: string;
}
