import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class MonthDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
