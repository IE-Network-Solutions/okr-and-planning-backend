import { IsBoolean, IsDateString, IsString } from "class-validator";

export class JobInformationDto {

    @IsString()
    jobTitle?: string;


    @IsString()
    branchId?: string;

    @IsBoolean()
    isPositionActive?: boolean;


    @IsDateString()
    effectiveStartDate?: Date;

    @IsDateString()
    effectiveEndDate?: Date;


    @IsString()
    employementTypeId?: string;

    @IsString()
    departmentId?: string;

    @IsBoolean()
    departmentLeadOrNot?: boolean;

    @IsString()
    workScheduleId?: string;

    @IsString()
    userId?: string;
}