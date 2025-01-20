import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';
import { CreateFailureReasonDto } from '../../failure-reason/dto/create-failure-reason.dto';
export class ReportTaskDTO {
  [key: string]: {
    status: ReportStatusEnum;
    failureReasonId?: string;
    isAchieved?: boolean;
    actualValue?: number | null;
    reason?: string;
    failureReason?: CreateFailureReasonDto;
  };
}
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
