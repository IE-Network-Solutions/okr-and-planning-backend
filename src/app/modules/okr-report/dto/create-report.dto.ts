import { IsEnum, IsInt, IsUUID } from 'class-validator';
import { ReportTaskDTO } from '../../okr-report-task/dto/create-okr-report-task.dto';

enum ReportStatusEnum {
  DRAFT = 'Draft',
  APPROVED = 'Approved',
  // Add other statuses as needed
}

export class ReportDTO {
//   @IsUUID()
//   id?: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  planId: string;

  @IsEnum(ReportStatusEnum)
  status: ReportStatusEnum;

  @IsInt()
  reportScore: number;

  @IsUUID()
  tenantId: string;

  tasks: ReportTaskDTO[];  // An array of tasks for the report
}
