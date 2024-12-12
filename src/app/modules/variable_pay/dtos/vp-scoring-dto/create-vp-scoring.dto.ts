import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateVpScoringCriterionDto } from '../vp-scoring-criteria-dto/create-vp-scoring-criterion.dto';
import { CreateUserVpScoringDto } from '../user-vp-scoring-dto/create-user-vp-scoring.dto';

export class CreateVpScoringDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  @Max(100)
  totalPercentage: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateVpScoringCriterionDto)
  vpScoringCriteria?: CreateVpScoringCriterionDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateUserVpScoringDto)
  createUserVpScoringDto?: CreateUserVpScoringDto[];
}
