import { PartialType } from '@nestjs/mapped-types';
import { CreateVpCriteriaDto } from './create-vp-criteria.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVpCriteriaDto extends PartialType(CreateVpCriteriaDto,
) {
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
