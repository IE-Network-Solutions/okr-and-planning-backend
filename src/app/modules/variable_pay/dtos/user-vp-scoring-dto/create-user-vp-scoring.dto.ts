import { IsOptional, IsUUID } from 'class-validator';

export class CreateUserVpScoringDto {
  @IsOptional()
  @IsUUID()
  id?: string;
  @IsUUID()
  userId?: string;
  @IsOptional()
  @IsUUID()
  vpScoringId?: string;
}
