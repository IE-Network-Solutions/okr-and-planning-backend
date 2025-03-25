import { IsOptional, IsString } from 'class-validator';
import { IntervalHierarchy } from '../enum/interval-type.enum';
export class CreatePlanningPeriodsDTO {
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  intervalLength: IntervalHierarchy;
 
  @IsString()
  intervalType: string;

  @IsOptional()
  @IsString()
  actionOnFailure: string;

  @IsOptional()
  @IsString()
  submissionDeadline: string;
}
