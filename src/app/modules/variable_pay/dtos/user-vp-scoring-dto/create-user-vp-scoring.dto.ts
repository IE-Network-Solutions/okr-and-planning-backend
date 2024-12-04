import { IsOptional, IsUUID } from "class-validator";

export class CreateUserVpScoringDto {
    
        @IsUUID()
        userId?: string;
        @IsOptional()
        @IsUUID()
        vpScoringId?: string;
      

  
}
