import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanTaskDto } from './create-plan-task.dto';

export class UpdatePlanTaskDto extends PartialType(CreatePlanTaskDto) {}
