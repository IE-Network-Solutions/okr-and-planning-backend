import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PlannnigPeriodUserDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  userIds: string[];

  @IsArray()
  @IsNotEmpty({ each: true })
  planningPeriods: string[];

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
