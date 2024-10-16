import { IsEnum, IsInt, IsString, IsUUID } from 'class-validator';
import { ReportTaskDTO } from '../../okr-report-task/dto/create-okr-report-task.dto';
import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';

export class RockStarDto {
  @IsString()
  planningPeriodId: string;

  @IsString()
  userId?: string;
}
