import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ReportCommentsService } from './report-comments.service';
import { CreateReportCommentDto } from './dto/create-report-coment.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('report-comments')
@ApiTags('report-comments')

export class ReportCommentsController {
  constructor(private readonly reportCommentService: ReportCommentsService) {}

  @Post()
  async createComment(    
    @Req() req: Request,
    @Body() createReportCommentDto: CreateReportCommentDto
  ) {
    const tenantId = req['tenantId'];
    return await this.reportCommentService.createComment(
      createReportCommentDto,
      tenantId
    );
  }

  @Get(':reportId')
  async getCommentsForReport(@Param('reportId') reportId: string) {
    return await this.reportCommentService.getCommentsForReport(reportId);
  }

  @Get()
  async getAllComments() {
    return await this.reportCommentService.getAllComments();
  }
}
