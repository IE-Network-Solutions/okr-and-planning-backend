import { PartialType } from '@nestjs/mapped-types';
import { CreateMilestoneDto } from './create-milestone.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMilestoneDto extends PartialType(CreateMilestoneDto) {
    @IsOptional()
    @IsString()
    id?: string
}
