import { PartialType } from '@nestjs/mapped-types';
import { CreateAppreciationDto } from './create-appreciation.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAppreciationDto extends PartialType(CreateAppreciationDto) {
  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
