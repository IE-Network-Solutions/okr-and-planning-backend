import { Body, Controller, Delete, Get, Headers, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OkrReportService } from './okr-report.service';
import { ReportDTO } from './dto/create-report.dto';
import { get } from 'https';

@Controller('okr-report')
@ApiTags('okr-report')
export class OkrReportController {
constructor(
    private readonly okrReportService: OkrReportService,
    ) {}
    @Post()
    create(
      @Body() createReportDto: ReportDTO,
      @Headers('tenantId') tenantId: string,     ) {
      return this.okrReportService.createReport(
        createReportDto,
        tenantId,
      );
    }
  // GET endpoint to fetch all reports filtered by tenantId
  @Post('/by-planning-period/:planningPeriodId') // Expecting planningPeriodId from the URL
  async getAllReports(
    @Req() request: Request,
    @Body() userIds: string[], // Expecting userIds to be an array of strings
    @Headers('tenantId') tenantId: string, // Expecting tenantId from headers
    @Param('planningPeriodId') planningPeriodId: string // Extract planningPeriodId from the URL
  ): Promise<any[]> {
    // Early return if userIds is null or an empty array
    if (!userIds || userIds.length === 0) {
      return []; 
    }
  
    // Pass tenantId, userIds, and planningPeriodId to your service method
    return this.okrReportService.getAllReportsByTenantAndPeriod(tenantId, userIds, planningPeriodId);
  }
    // DELETE endpoint to delete a report by id
    @Delete(':id')
    async deleteReport(
      @Param('id') id: string, 
      @Headers('tenantId') tenantId: string): Promise<void> {
      return this.okrReportService.deleteReport(id, tenantId);
    }
}
