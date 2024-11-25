import { IsDecimal, IsUUID } from "class-validator";

export class CreateVpScoreInstanceDto {
  
    @IsUUID()
    userId: string;
  
    @IsUUID()
    vpScoringId: string;
  
    @IsDecimal()
    vpScore: number;
  
    // @IsObject()
    // breakdown: Record<string, any>;
  
    @IsUUID()
    monthId: string;
  
    @IsUUID()
    tenantId: string;
}
