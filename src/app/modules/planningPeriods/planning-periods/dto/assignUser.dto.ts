import { IsString, IsOptional } from 'class-validator';
export class AssignUsersDTO {
  @IsString()
  userId: string;

  @IsString()
  planningPeriodId: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
