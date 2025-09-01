import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateFailureReasonDto } from '../../failure-reason/dto/create-failure-reason.dto';
import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';
import { Transform } from 'class-transformer';

// export class ReportTaskDTO {
//   [key: string]: {
//     status: ReportStatusEnum;
//     failureReasonId?: string;
//     isAchieved?: boolean;
//     actualValue?: number | null;
//     reason?: string;
//     failureReason?: CreateFailureReasonDto;
//   };


export class ReportTaskItem {
  @IsEnum(ReportStatusEnum)
  status: ReportStatusEnum;

  @IsOptional()
  @IsString()
  failureReasonId?: string;

  @IsOptional()
  @IsBoolean()
  isAchieved?: boolean;

  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber({ maxDecimalPlaces: 3 })
  actualValue?: number;

  @IsOptional()
  @IsString()
  customReason?: string;
}

export type ReportTaskInput = Record<string, ReportTaskItem>;

// export type ReportTaskInput = Record<
//   string,
//   {
//     status: ReportStatusEnum; // Required field
//     failureReasonId?: string; // Optional field
//     isAchieved?: boolean; // Optional field
//     actualValue?: number; // Optional field
//     customReason?: string; // Optional field
//   }
// >;
