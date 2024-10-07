import { IsOptional, IsString } from 'class-validator';

export class FilterReprimandLogDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  typeId?: string;
}
