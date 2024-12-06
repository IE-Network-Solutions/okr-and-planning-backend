import { IsArray, IsString, IsUUID } from "class-validator";

export class RefreshVPDto {
    
  
    @IsArray()
    @IsString({ each: true })
    users?: string[];

}