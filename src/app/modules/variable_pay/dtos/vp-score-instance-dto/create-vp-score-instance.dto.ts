import { Type } from "class-transformer";
import { IsArray, IsDecimal, IsUUID, ValidateNested } from "class-validator";
import { VpScoreBreakDownDto } from "./vp-score-break-down.dto";

export class CreateVpScoreInstanceDto {
  
    @IsUUID()
    userId: string;
  
    @IsUUID()
    vpScoringId: string;
  
    @IsDecimal()
    vpScore: number;
  
  
    @ValidateNested({ each: true })
    @Type(() => VpScoreBreakDownDto)
    breakdown?:VpScoreBreakDownDto[];
  
    @IsUUID()
    monthId: string;
  
}
