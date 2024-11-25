import { IsInt, IsString, IsUUID, Max, Min } from "class-validator";

export class CreateVpScoringDto {
    @IsString()
    name: string;
  
    @IsInt()
    @Min(0)
    @Max(100)
    totalPercentage: number;
  
    @IsUUID()
    tenantId: string;
}
