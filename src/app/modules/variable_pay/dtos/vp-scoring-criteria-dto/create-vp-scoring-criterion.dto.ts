import { IsDecimal, IsNumber, IsOptional, IsUUID } from "class-validator";

export class CreateVpScoringCriterionDto {
  @IsOptional()
    @IsUUID()
    id?: string;
  @IsOptional()
    @IsUUID()
    vpScoringId?: string;
 
    @IsUUID()
    vpCriteriaId: string;
  
    @IsNumber()
    weight: number;
  
   
}
