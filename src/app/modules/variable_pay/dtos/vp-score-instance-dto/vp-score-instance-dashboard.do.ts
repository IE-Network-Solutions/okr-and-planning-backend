import { IsDecimal, IsOptional, IsString, ValidateNested } from 'class-validator';
import { VpScoreBreakDownDto } from './vp-score-break-down.dto';
import { Type } from 'class-transformer';

export class VpScoreDashboardDto {
  @IsDecimal()
  score: number = 0;

  @IsDecimal()
  maxScore: number = 0;

  @IsDecimal()
  previousScore: number = 0;
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VpScoreDashboardCriteriaDto)
  criteria?: VpScoreDashboardCriteriaDto[];
}


export class VpScoreDashboardCriteriaDto {
    @IsString() 
    name:string
    @IsDecimal()
    weight:number=0
    @IsDecimal()
    score:number=0
    @IsDecimal()
    previousScore:number=0
  }

  export class VpScoreTargetDashboardCriteriaDto {
    @IsString() 
    criteriaName:string
    @IsDecimal()
    targetValue:number=0
    @IsDecimal()
    actualScore:number=0
  }
