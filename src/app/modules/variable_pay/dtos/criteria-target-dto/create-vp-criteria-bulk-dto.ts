import { Type } from "class-transformer";
import { IsDecimal, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { optional } from "joi";

export class CreateCriteriaTargetForMultipleDto {

    @IsOptional()
    @IsUUID()
    departmentId?: string;
  
    @IsUUID()
    vpCriteriaId: string;
  @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => TargetDto)
    target?:TargetDto[];
  
    @IsUUID()
    createdBy: string;
}



export class TargetDto {

    @IsDecimal()
    target: number;
  
    @IsOptional()
    @IsString()
    month?: string;

  }