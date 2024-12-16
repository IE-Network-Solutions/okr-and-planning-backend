import { PartialType } from '@nestjs/mapped-types';
import { CreateUserVpScoringDto } from './create-user-vp-scoring.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateUserVpScoringDto extends PartialType(
  CreateUserVpScoringDto,
) {
    @IsOptional()
    @IsUUID()
    updatedBy?:string
}
