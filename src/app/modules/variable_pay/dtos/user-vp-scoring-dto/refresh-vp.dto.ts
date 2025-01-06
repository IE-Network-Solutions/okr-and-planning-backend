import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class RefreshVPDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  users?: string[];
}
