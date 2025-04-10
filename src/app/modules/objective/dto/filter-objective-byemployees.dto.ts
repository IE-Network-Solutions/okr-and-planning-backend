import { IsArray, IsOptional, IsString } from "class-validator";

export class FilterObjectiveOfAllEmployeesDto {

  @IsArray()
  @IsString({ each: true })
  sessions?: string[];
}