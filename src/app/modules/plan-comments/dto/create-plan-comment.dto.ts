import { IsString, IsOptional } from 'class-validator';

export class CreatePlanCommentDto {
  @IsString()
  commentedBy: string;

  @IsString()
  planId: string;

  @IsString()
  comment: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
