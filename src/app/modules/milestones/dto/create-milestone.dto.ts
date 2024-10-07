import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Status } from '../enum/milestone.status.enum';
export class CreateMilestoneDto {
  @IsOptional()
  @IsString()
  keyResultId?: string;
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  status?: Status;
  @IsNumber()
  weight: number;
}
