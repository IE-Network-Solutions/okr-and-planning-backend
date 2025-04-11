import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class WeeklyPriorityWeekDto {
  @IsString()
  title: string;

  @IsNumber()
  count: number;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
