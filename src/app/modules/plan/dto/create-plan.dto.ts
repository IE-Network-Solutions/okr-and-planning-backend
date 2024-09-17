import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  tenantId: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  parentPlanId: string;

  @IsString()
  planningUserId: string;

  @IsInt()
  level: number;
}
