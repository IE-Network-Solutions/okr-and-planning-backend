import { IsArray, IsNotEmpty } from 'class-validator';

export class PlannnigPeriodUserDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  userIds: string[];

  @IsArray()
  @IsNotEmpty({ each: true })
  planningPeriods: string[];
}
