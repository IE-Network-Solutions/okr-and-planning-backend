import { PartialType } from '@nestjs/mapped-types';
import { CreateVpScoringDto } from './create-vp-scoring.dto';

export class UpdateVpScoringDto extends PartialType(CreateVpScoringDto) {}
