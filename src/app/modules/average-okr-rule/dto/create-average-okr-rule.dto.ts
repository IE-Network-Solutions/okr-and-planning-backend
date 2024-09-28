import { IsNumber, IsString } from 'class-validator';

export class CreateAverageOkrRuleDto {
  @IsNumber()
  myOkrPercentage: number;
  @IsNumber()
  teamOkrPercentage: number;
}
