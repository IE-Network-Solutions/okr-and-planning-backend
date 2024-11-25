import { IsBoolean, IsEnum, IsString } from "class-validator";
import { SourceService } from "../../enums/sourceService.enum";

export class CreateVpCriteriaDto {

    @IsString()
    name: string;
  
    @IsString()
    description: string;
  
    @IsEnum(SourceService)
    sourceService: SourceService;
  
    @IsString()
    sourceEndpoint: string;
  
    @IsBoolean()
    isDeduction: boolean;
  
    @IsBoolean()
    active: boolean;
}
