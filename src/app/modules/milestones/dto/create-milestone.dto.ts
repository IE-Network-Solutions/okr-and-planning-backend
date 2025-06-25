import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Status } from '../enum/milestone.status.enum';
import { Transform } from 'class-transformer';
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
  @Transform(({ value }) => value === null ? null : parseFloat(value))

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
