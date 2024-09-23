import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanTaskDto } from './create-plan-task.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePlanTaskDto extends PartialType(CreatePlanTaskDto) {
  @IsOptional()
  subTasks?: CreatePlanTaskDto[];

  @IsString()
  @IsOptional()
  id: string;
}
