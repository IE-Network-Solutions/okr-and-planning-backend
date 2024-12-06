import { PartialType } from '@nestjs/mapped-types';
import { CreateVpScoringCriterionDto } from './create-vp-scoring-criterion.dto';
import { IsUUID } from 'class-validator';

export class UpdateVpScoringCriterionDto extends PartialType(CreateVpScoringCriterionDto) {
   
}
