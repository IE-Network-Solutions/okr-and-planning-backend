import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDecimal,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { optional } from 'joi';
import { CreateCriteriaTargetForMultipleDto } from './create-vp-criteria-bulk-dto';
export class UpdateCriteriaTargetForMultipleDto extends PartialType(
  CreateCriteriaTargetForMultipleDto,
) {
  @IsUUID()
  updatedBy: string;
}
