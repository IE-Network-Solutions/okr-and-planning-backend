import { IsOptional, IsString } from 'class-validator';
export class CreatePlanningPeriodsDTO {
  @IsString()
  name: string;

  @IsString()
  intervalLength: string;

  @IsString()
  intervalType: string;

  @IsOptional()
  @IsString()
  actionOnFailure: string;

  @IsString()
  submissionDeadline: string;
}
