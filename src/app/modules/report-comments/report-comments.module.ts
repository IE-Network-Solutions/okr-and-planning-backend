import { Module } from '@nestjs/common';
import { ReportCommentsController } from './report-comments.controller';
import { ReportCommentsService } from './report-comments.service';

@Module({
  controllers: [ReportCommentsController],
  providers: [ReportCommentsService]
})
export class ReportCommentsModule {}
