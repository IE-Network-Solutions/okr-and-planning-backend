import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCarbonCopyLogDto {
  @IsUUID()
  @IsNotEmpty()
  copyUserId: string;

  @IsOptional()
  @IsUUID()
  reprimandLogId?: string;

  @IsOptional()
  @IsUUID()
  appreciationLogId?: string;
}
