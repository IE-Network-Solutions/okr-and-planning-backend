import { IsDecimal, IsOptional, IsUUID } from "class-validator";

export class CreateVpScoringCriterionDto {
  @IsOptional()
    @IsUUID()
    vpScoringId?: string;
 
    @IsUUID()
    vpCriteriaId: string;
  
    @IsDecimal()
    weight: number;
  
   
}
