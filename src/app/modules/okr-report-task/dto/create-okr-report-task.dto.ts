import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateFailureReasonDto } from '../../failure-reason/dto/create-failure-reason.dto';
import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';

// export class ReportTaskDTO {
//   [key: string]: {
//     status: ReportStatusEnum;
//     failureReasonId?: string;
//     isAchieved?: boolean;
//     actualValue?: number | null;
//     reason?: string;
//     failureReason?: CreateFailureReasonDto;
//   };

export type ReportTaskInput = Record<
  string,
  {
    status: ReportStatusEnum; // Required field
    failureReasonId?: string; // Optional field
    isAchieved?: boolean; // Optional field
    actualValue?: number; // Optional field
    customReason?: string; // Optional field
    createdBy?: string; // Optional field
    updatedBy?: string; // Optional field
  }
>;
