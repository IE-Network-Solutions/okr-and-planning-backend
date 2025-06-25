import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';
import { IsEnum, IsString, IsOptional } from 'class-validator';

export class CreateFailureReasonDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
