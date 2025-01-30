import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OkrReportService } from './okr-report.service';
import { UUID } from 'crypto';
import { CreateReportDTO } from './dto/create-report.dto';
import { RockStarDto } from './dto/report-rock-star.dto';
import { Report } from './entities/okr-report.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('okr-report')
@ApiTags('okr-report')
export class OkrReportController {
  constructor(private readonly reportService: OkrReportService) {}

  @Post('/create-report')
  async createReport(
    @Body() reportData: CreateReportDTO,
    @Headers('tenantId') tenantId: UUID, // Expecting tenantId from headers
    @Param('userId') userId: string, // Extract the planningPeriodId from the route
  ): Promise<any> {
    return await this.reportService.createReportWithTasks(reportData, tenantId);
  }

  @Post('/by-planning-period/:planningPeriodId') // Expecting planningPeriodId from the URL
  async getAllReports(
    @Body() userIds: (string | 'all')[], // Expecting userIds to be an array of strings or 'all'
    @Headers('tenantId') tenantId: UUID, // Expecting tenantId from headers
    @Param('planningPeriodId') planningPeriodId: string, // Extract the planningPeriodId from the route
     @Query() paginationOptions?: PaginationDto,
  ):Promise<Pagination<Report>> {
    const report= {  items:[],
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 0,
        totalPages:0,
        currentPage: 0,
      }
    }
    if (!userIds || userIds.length === 0) {
      return  report
    }
    return this.reportService.getAllReportsByTenantAndPeriod(
      tenantId,
      userIds,
      planningPeriodId,
      paginationOptions
    );
  }
  @Delete(':id')
  async deleteReport(
    @Param('id') id: string,
    @Headers('tenantId') tenantId: UUID,
  ): Promise<void> {
    return this.reportService.deleteReport(id, tenantId);
  }
  @Get('/rock-star/user')
  async rockStart(@Req() req: Request, @Query() rockStarDto?: RockStarDto) {
    const tenantId = req['tenantId'];
    return await this.reportService.rockStart(rockStarDto, tenantId);
  }

  @Get('/performance/user')
  async userPerformance(
    @Req() req: Request,
    @Query() rockStarDto?: RockStarDto,
  ) {
    const tenantId = req['tenantId'];
    return await this.reportService.userPerformance(rockStarDto, tenantId);
  }
  @Get('/:reportId')
  async getReportDataById(
    @Req() req: Request,
    @Param('reportId') reportId: string,
  ): Promise<Report> {
    const tenantId = req['tenantId'];
    return await this.reportService.getById(reportId);
  }

  @Post('validate/:reportId')
  async validate(
    @Req() req: Request,
    @Param('reportId') reportId: string,
    @Query('value') value: string,
  ): Promise<Report> {
    const tenantId = req['tenantId'];
    return await this.reportService.validate(reportId, tenantId, value);
  }
}
