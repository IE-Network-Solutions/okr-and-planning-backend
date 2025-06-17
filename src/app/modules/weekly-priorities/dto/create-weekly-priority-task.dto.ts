import { IsString } from 'class-validator';
import { Status } from '../enums/status.enum';

export class CreateWeeklyPriorityDto {
  @IsString()
  title: string;
  @IsString()
  departmentId: string;

  @IsString()
  planId: string;

  @IsString()
  taskId: string;

  @IsString()
  status: Status;

  @IsString()
  month?: string;
  @IsString()
  session?: string;

  @IsString()
  @IsOptional()
  failureReason?: string;
}
