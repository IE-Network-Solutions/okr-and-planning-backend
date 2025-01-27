import { IsOptional, IsString } from 'class-validator';
import { IntervalHierarchy } from '../enum/interval-type.enum';
export class CreatePlanningPeriodsDTO {
  @IsString()
  name: string;

  @IsString()
  intervalLength: IntervalHierarchy;

  @IsString()
  intervalType: string;

  @IsOptional()
  @IsString()
  actionOnFailure: string;

  @IsString()
  submissionDeadline: string;
}
