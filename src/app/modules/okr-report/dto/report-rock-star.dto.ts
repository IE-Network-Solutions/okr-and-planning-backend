import { IsOptional, IsString, IsUUID } from 'class-validator';

export class RockStarDto {
  @IsUUID()
  planningPeriodId: string;
  @IsOptional()
  @IsString()
  userId?: string;
}
