import { PartialType } from '@nestjs/mapped-types';
import { CreateVpCriteriaDto } from './create-vp-criteria.dto';

export class UpdateVpCriteriaDto extends PartialType(CreateVpCriteriaDto) {}
