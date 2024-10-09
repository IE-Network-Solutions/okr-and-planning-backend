import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';
import { IsEnum, IsString } from 'class-validator';

export class CreateFailureReasonDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}
