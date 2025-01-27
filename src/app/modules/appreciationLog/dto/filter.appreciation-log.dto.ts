import { IsOptional, IsString } from 'class-validator';

export class FilterAppreciationLogDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  typeId?: string;
}
