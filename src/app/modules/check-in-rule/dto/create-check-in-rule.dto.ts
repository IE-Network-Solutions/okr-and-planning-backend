import { IsString, IsEnum, IsUUID, IsBoolean, IsInt, IsOptional, Min, MaxLength } from 'class-validator';
import { AppliesTo } from '../enum/applies-to.enum';
import { Operation } from '../enum/operation.enum';
import { Action } from '../enum/action.enum';

export class CreateCheckInRuleDto {
  @IsString()
  @MaxLength(500)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AppliesTo)
  appliesTo: AppliesTo;

  @IsUUID()
  planningPeriodId: string;

  @IsBoolean()
  timeBased: boolean;

  @IsBoolean()
  achievementBased: boolean;

  @IsInt()
  @Min(1)
  frequency: number;

  @IsEnum(Operation)
  operation: Operation;

  @IsUUID()
  tenantId: string;

  @IsUUID()
  categoryId: string;

  @IsEnum(Action)
  action: Action;
} 