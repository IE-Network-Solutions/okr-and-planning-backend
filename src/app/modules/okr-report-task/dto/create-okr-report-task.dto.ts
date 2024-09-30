import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateFailureReasonDto } from '../../failure-reason/dto/create-failure-reason.dto';

export class ReportTaskDTO {
  @IsUUID()
  id: string;

  @IsUUID()
  reportId: string;

  @IsUUID()
  planTaskId: string;

  @IsOptional()
  @IsUUID()
  failureReasonId?: string;

  @IsString()
  actualValue: string;

  @IsBoolean()
  isAchieved: boolean;

  @IsOptional()
  @IsString()
  customReason?: string;

  @IsUUID()
  tenantId: string;

  @IsOptional()
  failureReason?: CreateFailureReasonDto;  // Optional field for failure reason details
}
