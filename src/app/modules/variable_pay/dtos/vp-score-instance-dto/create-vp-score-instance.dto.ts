import { IsArray, IsDecimal, IsUUID } from "class-validator";

export class CreateVpScoreInstanceDto {
  
    @IsUUID()
    userId: string;
  
    @IsUUID()
    vpScoringId: string;
  
    @IsDecimal()
    vpScore: number;
  
  @IsArray()
    breakdown: Record<string, any>;
  
    @IsUUID()
    monthId: string;
  
}
