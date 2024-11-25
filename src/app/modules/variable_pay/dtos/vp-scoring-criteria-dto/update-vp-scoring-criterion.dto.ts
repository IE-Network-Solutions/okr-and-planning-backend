import { PartialType } from '@nestjs/mapped-types';
import { CreateVpScoringCriterionDto } from './create-vp-scoring-criterion.dto';

export class UpdateVpScoringCriterionDto extends PartialType(CreateVpScoringCriterionDto) {}
