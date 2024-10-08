import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { OkrReportTaskService } from './okr-report-task.service';
import { ReportTaskDTO } from './dto/create-okr-report-task.dto';

@Controller('okr-report-task')
@ApiTags('okr-report-task')
export class OkrReportTaskController {
  constructor(private readonly okrReportTaskService: OkrReportTaskService) {}
  @Post('/create-report/:userId/:planningPeriodId')
  create(
    @Body() createReportTaskDTO: ReportTaskDTO,
    @Param('userId') userId: string,
    @Param('planningPeriodId') planningPeriodId: string,
    @Headers('tenantId') tenantId: string,
  ) {
    return this.okrReportTaskService.create(
      createReportTaskDTO,
      tenantId,
      planningPeriodId,
      userId,
    );
  }

  @Get('/users/:userId/planning-period/:planningPeriodId')
  getAllUnReportedTasks(
    @Param('planningPeriodId') planningPeriodId: string,
    @Param('userId') userId: string,
    @Headers('tenantId') tenantId: string,
  ) {
    return this.okrReportTaskService.getUnReportedPlanTasks(
      planningPeriodId,
      userId,
      tenantId,
    );
  }
  // GET endpoint to fetch all reports filtered by tenantId
  @Post('/by-planning-period/:planningPeriodId') // Expecting planningPeriodId from the URL
  async getAllReportTasks(
    @Body() userIds: string[], // Expecting userIds to be an array of strings
    @Headers('tenantId') tenantId: UUID, // Expecting tenantId from headers
    @Param('planningPeriodId') planningPeriodId: string, // Extract the planningPeriodId from the route
  ): Promise<any> {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    // Pass tenantId, userIds, and planningPeriodId to your service method
    return this.okrReportTaskService.findAllReportTasks(
      tenantId,
      userIds,
      planningPeriodId,
    );
  }
  // DELETE endpoint to delete a report by id
  @Delete(':id')
  async deleteReport(
    @Param('id') id: string,
    @Headers('tenantId') tenantId: UUID,
  ): Promise<any> {
    return this.okrReportTaskService.deleteReportTasks(id);
  }
}
