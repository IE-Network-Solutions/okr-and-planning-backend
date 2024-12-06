import { IsDecimal, IsString } from "class-validator"

export class VpScoreBreakDownDto {
   @IsString() 
targetId:string
@IsString() 
criteriaId:string
@IsDecimal()
weight:number
@IsDecimal()
score:number


}