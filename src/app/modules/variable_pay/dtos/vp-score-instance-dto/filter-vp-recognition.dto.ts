import { Transform } from 'class-transformer';
import {
  IsUUID,
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class FilterVPRecognitionDTo {
  @IsDateString()
  startDate: string;
  @IsDateString()
  endDate: string;
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNumber()
  value: number;

  @IsString()
  condition: string;
}
