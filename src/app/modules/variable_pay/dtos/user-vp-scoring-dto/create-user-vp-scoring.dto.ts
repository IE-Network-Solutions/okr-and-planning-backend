import { IsUUID } from "class-validator";

export class CreateUserVpScoringDto {

        @IsUUID()
        userId: string;
      
        @IsUUID()
        vpScoringId: string;
      
        @IsUUID()
        tenantId: string;
  
}
