import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterObjectiveOfAllEmployeesDto {
  @IsArray()
  @IsString({ each: true })
  sessions?: string[];

  @Transform(({ value }) => (value === '' ? null : value))
  @IsUUID()
  @IsOptional()
  userId?: string;

  @Transform(({ value }) => (value === '' ? null : value))
  @IsUUID()
  @IsOptional()
  departmentId?: string;


//   @Transform(({ value }) => parseFloat(value))
//   @IsNumber({ maxDecimalPlaces: 2 })
//   @IsNumber()
}
