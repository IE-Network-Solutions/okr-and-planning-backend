import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanCommentDto } from './create-plan-comment.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePlanCommentDto extends PartialType(CreatePlanCommentDto) {
  @IsOptional()
  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  updatedBy: string;
}
