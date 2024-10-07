import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReportCommentsService } from './report-comments.service';
import { CreateReportCommentDto } from './dto/create-report-coment.dto';

@Controller('report-comments')
export class ReportCommentsController {

  constructor(private readonly reportCommentService: ReportCommentsService) {}

  @Post()
  async createComment(@Body() createReportCommentDto: CreateReportCommentDto) {
    return await this.reportCommentService.createComment(createReportCommentDto);
  }

  @Get('report/:reportId')
  async getCommentsForReport(@Param('reportId') reportId: string) {
    return await this.reportCommentService.getCommentsForReport(reportId);
  }

  @Get()
  async getAllComments() {
    return await this.reportCommentService.getAllComments();
  }
}
