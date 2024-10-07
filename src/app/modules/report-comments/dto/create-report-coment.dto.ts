import { IsUUID, IsString } from 'class-validator';

export class CreateReportCommentDto {
  @IsUUID()
  reportId: string;

  @IsUUID()
  commentedById: string;

  @IsString()
  commentText: string;

  @IsUUID()
  tenantId: string;
}
