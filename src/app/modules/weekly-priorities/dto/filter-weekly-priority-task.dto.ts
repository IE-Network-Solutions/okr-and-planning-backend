import { IsArray } from 'class-validator';

export class FilterWeeklyPriorityDto {
  @IsArray()
  departmentId: string[];

  @IsArray()
  weeklyPriorityWeekId: string[];
}
