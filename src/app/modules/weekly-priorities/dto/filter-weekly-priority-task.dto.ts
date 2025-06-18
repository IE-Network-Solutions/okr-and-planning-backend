import { IsArray } from 'class-validator';

export class FilterWeeklyPriorityDto {
  @IsArray()
  departmentId: string[];

  @IsArray()
  planId: string[];

  @IsArray()
  taskId: string[];

  @IsArray()
  weeklyPriorityWeekId: string[];
}
