import { IsString } from 'class-validator';

export class CreatePlanCommentDto {
  @IsString()
  commentedBy: string;

  @IsString()
  planId: string;

  @IsString()
  comment: string;
}
