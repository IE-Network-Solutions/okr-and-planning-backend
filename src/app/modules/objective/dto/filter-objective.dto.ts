import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';

export class FilterObjectiveDto {
    @IsOptional()
    @IsString()
    metricTypeId?: string;
    @IsOptional()
    @IsString()
    userId?: string;
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    users?: string[];


}
