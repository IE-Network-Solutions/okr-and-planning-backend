import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentPlanId?: string;

  @IsString()
  planningUserId: string;

  @IsInt()
  level: number;
}
