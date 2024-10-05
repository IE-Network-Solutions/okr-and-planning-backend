import { IsNumber } from 'class-validator';

export class OkrProgressDto {
  @IsNumber()
  okr: number;
  @IsNumber()
  okrCompleted: number;
  @IsNumber()
  daysLeft: number;
  @IsNumber()
  keyResultcount: number;
}
