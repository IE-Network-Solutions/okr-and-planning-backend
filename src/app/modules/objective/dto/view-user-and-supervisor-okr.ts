import { IsNumber } from 'class-validator';

export class ViewUserAndSupervisorOKRDto {
  @IsNumber()
  supervisorOkr: number;
  @IsNumber()
  userOkr: number;
  @IsNumber()
  okrCompleted: number;
  @IsNumber()
  daysLeft: number;
}
