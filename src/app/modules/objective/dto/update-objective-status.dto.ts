import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateObjectiveStatusDto {
  @IsBoolean()
  isClosed: boolean;
  @IsUUID()
  sessionId: string;
  @IsOptional()
  @IsUUID()
  userId?: string;
}
