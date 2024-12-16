import { PartialType } from '@nestjs/mapped-types';
import { CreateVpScoringDto } from './create-vp-scoring.dto';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateVpScoringCriterionDto } from '../vp-scoring-criteria-dto/update-vp-scoring-criterion.dto';
import { UpdateUserVpScoringDto } from '../user-vp-scoring-dto/update-user-vp-scoring.dto';

export class UpdateVpScoringDto extends PartialType(CreateVpScoringDto) {
  @IsOptional()
  @IsUUID()
  updatedBy?:string
}
