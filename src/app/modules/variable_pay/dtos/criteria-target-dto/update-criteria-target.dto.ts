import { PartialType } from '@nestjs/mapped-types';
import { CreateCriteriaTargetDto } from './create-criteria-target.dto';
import { IsUUID } from 'class-validator';

export class UpdateCriteriaTargetDto extends PartialType(CreateCriteriaTargetDto) {
    @IsUUID()
    updatedBy: string;
}
