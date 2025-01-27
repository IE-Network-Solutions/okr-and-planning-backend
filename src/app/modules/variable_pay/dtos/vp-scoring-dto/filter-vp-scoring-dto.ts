import { IsOptional, IsUUID } from "class-validator";

export class VpScoringFilterDto {

   
    
    @IsUUID()
    @IsOptional()
    monthId?: string;
  
   
  }