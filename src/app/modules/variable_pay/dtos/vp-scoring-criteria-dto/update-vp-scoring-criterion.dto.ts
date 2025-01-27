import { PartialType } from '@nestjs/mapped-types';
import { CreateVpScoringCriterionDto } from './create-vp-scoring-criterion.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateVpScoringCriterionDto extends PartialType(
  CreateVpScoringCriterionDto,
) {
  @IsOptional()
  @IsUUID()
  updateBy?: string;
}
