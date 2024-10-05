import { IsNumber } from 'class-validator';

export class ViewUserAndSupervisorOKRDto {
  @IsNumber()
  keyResultCount: number;
  @IsNumber()
  teamOkr: number;
  @IsNumber()
  companyOkr: number;
  @IsNumber()
  supervisorOkr: number;
  @IsNumber()
  userOkr: number;
  @IsNumber()
  okrCompleted: number;
  @IsNumber()
  daysLeft: number;
}
