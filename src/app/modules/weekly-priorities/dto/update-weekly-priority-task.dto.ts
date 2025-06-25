import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklyPriorityDto } from './create-weekly-priority-task.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateWeeklyPriorityDto extends PartialType(
  CreateWeeklyPriorityDto,
) {
  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
