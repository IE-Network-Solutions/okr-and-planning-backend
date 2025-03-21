import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklyPriorityDto } from './create-weekly-priority-task.dto';

export class UpdateWeeklyPriorityDto extends PartialType(
  CreateWeeklyPriorityDto,
) {}
