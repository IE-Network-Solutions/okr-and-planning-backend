import { IsArray, IsOptional, IsString } from 'class-validator';

export class AllEmployeeOkrData {
  @IsString()
  userId: string;

  @IsString()
  sessionId: string;

  @IsString()
  okrScore: number;
}
