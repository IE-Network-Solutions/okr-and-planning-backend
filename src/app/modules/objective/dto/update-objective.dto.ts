import { PartialType } from '@nestjs/swagger';
import { CreateObjectiveDto } from './create-objective.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateObjectiveDto extends PartialType(CreateObjectiveDto) {
  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
