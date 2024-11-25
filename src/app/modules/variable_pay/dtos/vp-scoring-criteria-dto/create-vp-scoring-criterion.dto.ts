import { IsDecimal, IsUUID } from "class-validator";

export class CreateVpScoringCriterionDto {
  
    @IsUUID()
    vpScoringId: string;
  
    @IsUUID()
    vpCriteriaId: string;
  
    @IsDecimal()
    weight: number;
  
    @IsUUID()
    tenantId: string;
}
