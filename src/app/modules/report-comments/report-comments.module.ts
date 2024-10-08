import { Module } from '@nestjs/common';
import { ReportCommentsController } from './report-comments.controller';
import { ReportCommentsService } from './report-comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportComment } from './entities/report-comment.entity';
import { Report } from '../okr-report/entities/okr-report.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([ReportComment, Report]), // Ensure all required repositories are included
  ],
  providers: [ReportCommentsService],
  controllers: [ReportCommentsController],
  exports: [ReportCommentsService], // Export if you plan to use ReportCommentService in other modules
})
export class ReportCommentsModule {}
