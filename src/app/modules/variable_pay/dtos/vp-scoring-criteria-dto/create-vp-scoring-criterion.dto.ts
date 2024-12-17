import { IsDecimal, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { isDecimal } from 'validator';

export class CreateVpScoringCriterionDto {
  @IsOptional()
  @IsUUID()
  id?: string;
  @IsOptional()
  @IsUUID()
  vpScoringId?: string;

  @IsUUID()
  vpCriteriaId: string;

  @IsDecimal()
  weight: number;
  @IsOptional()
  @IsUUID()
  createdBy?:string
}
