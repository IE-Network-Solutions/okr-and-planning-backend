import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateFailureReasonDto } from '../../failure-reason/dto/create-failure-reason.dto';
type Status = 'Done' | 'Not Done'; // Define the allowed status values

export class ReportTaskDTO {
  [key: string]: {
    status: Status;
    failureReasonId?: string;
    isAchieved?: boolean;
    actualValue?: number | null;
    reason?: string;
    failureReason?: CreateFailureReasonDto;
  };
  // @IsString()
  // planTaskId: string;

  // @IsString()
  // status?: string;

  // @IsOptional()
  // @IsString()
  // failureReasonId?: string;

  // @IsString()
  // actualValue?: string;

  // @IsBoolean()
  // isAchieved?: boolean;

  // @IsOptional()
  // @IsString()
  // customReason?: string;

  // @IsString()
  // tenantId: string;

  // @IsOptional()
  // failureReason?: CreateFailureReasonDto;  // Optional field for failure reason details
}
