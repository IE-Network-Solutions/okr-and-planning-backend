import { CreatePlanTaskDto } from './create-plan-task.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePlanTaskDto extends CreatePlanTaskDto {
  @IsOptional()
  subTasks?: CreatePlanTaskDto[];

  @IsString()
  @IsOptional()
  id: string;
}

export class UpdateStatusDto {
  status: string;
}
