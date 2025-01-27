import { IsUUID, IsString } from 'class-validator';

export class CreateReportCommentDto {
  @IsUUID()
  reportId: string;

  @IsUUID()
  commentedBy: string;

  @IsString()
  comment: string;

  // @IsUUID()
  // tenantId: string;
}
