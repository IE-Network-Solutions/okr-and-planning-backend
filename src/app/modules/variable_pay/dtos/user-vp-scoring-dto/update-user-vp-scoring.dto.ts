import { PartialType } from '@nestjs/mapped-types';
import { CreateUserVpScoringDto } from './create-user-vp-scoring.dto';

export class UpdateUserVpScoringDto extends PartialType(CreateUserVpScoringDto) {}
