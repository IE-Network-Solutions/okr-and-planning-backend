import { IsDecimal, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateCriteriaTargetDto {

    @IsOptional()
    @IsUUID()
    departmentId?: string;
  
    @IsUUID()
    vpCriteriaId: string;
  
    @IsDecimal()
    target: number;
  
    @IsOptional()
    @IsString()
    month?: string;

    @IsUUID()
    createdBy: string;
}



