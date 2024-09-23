import { IsOptional, IsUUID } from 'class-validator';

export class FilterObjectiveDto {
  @IsOptional()
  @IsUUID()
  metricTypeId?: string;
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
