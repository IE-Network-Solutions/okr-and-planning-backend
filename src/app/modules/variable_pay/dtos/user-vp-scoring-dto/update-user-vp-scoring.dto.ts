import { PartialType } from '@nestjs/mapped-types';
import { CreateUserVpScoringDto } from './create-user-vp-scoring.dto';
import { IsUUID } from 'class-validator';

export class UpdateUserVpScoringDto extends PartialType(
  CreateUserVpScoringDto,
) {}
