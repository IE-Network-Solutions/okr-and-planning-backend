import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

export class VpScoreTargetFilterDto {
  @IsOptional()
  @IsArray()
  // @ValidateNested({ each: true })
  @Type(() => String)
  activeMonthIds?: string[];
  @IsUUID()
  userId: string;
}
