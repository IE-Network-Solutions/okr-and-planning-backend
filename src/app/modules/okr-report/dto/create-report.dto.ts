import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { ReportTaskDTO } from '../../okr-report-task/dto/create-okr-report-task.dto';
import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';

export class CreateReportDTO {
  @IsString()
  reportTitle: string;

  @IsString()
  userId?: string;
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  planId?: string;

  // @IsString(ReportStatusEnum)
  @IsString()
  status?: ReportStatusEnum;

  @IsString()
  reportScore?: string;

  @IsString()
  tenantId: string;

  tasks?: ReportTaskDTO[]; // An array of tasks for the report
}
