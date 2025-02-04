import { Type } from 'class-transformer';
import { IsArray, IsOptional } from 'class-validator';

export class VpScoreFilterDto {
  @IsOptional()
  @IsArray()
  // @ValidateNested({ each: true })
  @Type(() => String)
  monthIds?: string[];
}
