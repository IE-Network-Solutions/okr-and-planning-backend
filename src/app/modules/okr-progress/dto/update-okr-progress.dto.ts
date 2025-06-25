import { PartialType } from '@nestjs/mapped-types';
import { CreateOkrProgressDto } from './create-okr-progress.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOkrProgressDto extends PartialType(CreateOkrProgressDto) {
  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
