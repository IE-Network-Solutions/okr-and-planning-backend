import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportComment } from './entities/report-comment.entity';
import { CreateReportCommentDto } from './dto/create-report-coment.dto';
import { Report } from '../okr-report/entities/okr-report.entity';


@Injectable()
@Injectable()
export class ReportCommentsService {
  constructor(
    @InjectRepository(ReportComment)
    private readonly reportCommentRepository: Repository<ReportComment>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async createComment(createReportCommentDto: CreateReportCommentDto): Promise<ReportComment> {
    const { reportId, commentedById, commentText, tenantId } = createReportCommentDto;

    // Ensure the report, user, and tenant exist
    const report = await this.reportRepository.findOne({ where: { id: reportId } });
    // const user = await this.userRepository.findOne({ where: { id: commentedById } });
    // const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });

    // if (!report || !user || !tenant) {
    //   throw new Error('Report, User, or Tenant not found');
    // }

    const newComment = this.reportCommentRepository.create({
      reportId,
      commentedById,
      commentText,
      tenantId,
    });

    return await this.reportCommentRepository.save(newComment);
  }

  async getCommentsForReport(reportId: string): Promise<ReportComment[]> {
    return await this.reportCommentRepository.find({ where: { reportId }, relations: ['commentedBy'] });
  }

  async getAllComments(): Promise<ReportComment[]> {
    return await this.reportCommentRepository.find({ relations: ['report', 'commentedBy', 'tenant'] });
  }
}
