import {
  IsDecimal,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { VpScoreBreakDownDto } from './vp-score-break-down.dto';
import { Type } from 'class-transformer';

export class VpScoreDashboardDto {
  @IsDecimal()
  score = 0;

  @IsDecimal()
  maxScore = 0;

  @IsDecimal()
  previousScore = 0;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VpScoreDashboardCriteriaDto)
  criteria?: VpScoreDashboardCriteriaDto[];
}

export class VpScoreDashboardCriteriaDto {
  @IsString()
  name: string;
  @IsDecimal()
  weight = 0;
  @IsDecimal()
  score = 0;
  @IsDecimal()
  previousScore = 0;
}

export class VpScoreTargetDashboardCriteriaDto {
  @IsString()
  criteriaName: string;
  @IsDecimal()
  targetValue = 0;
  @IsDecimal()
  actualScore = 0;
}
