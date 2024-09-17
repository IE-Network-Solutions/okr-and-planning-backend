import { IsString } from 'class-validator';
export class AssignUsersDTO {
  @IsString()
  userId: string;

  @IsString()
  planningPeriodId: string;
}
