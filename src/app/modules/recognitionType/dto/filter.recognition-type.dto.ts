import { IsOptional, IsString } from 'class-validator';

export class FilterRecognitionTypeDto {
  @IsOptional()
  @IsString()
  type?: string;
}
