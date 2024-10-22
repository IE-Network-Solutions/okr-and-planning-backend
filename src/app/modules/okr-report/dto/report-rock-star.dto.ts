import { IsOptional, IsString } from 'class-validator';

export class RockStarDto {
  @IsString()
  planningPeriodId: string;
@IsOptional()
  @IsString()
  userId?: string;
}
