import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { OkrReportTaskService } from './okr-report-task.service';
import { ReportTaskInput } from './dto/create-okr-report-task.dto';

@Controller('okr-report-task')
@ApiTags('okr-report-task')
export class OkrReportTaskController {
  constructor(private readonly okrReportTaskService: OkrReportTaskService) {}
  @Post('/create-report/:userId/:planningPeriodId')
  create(
    @Body() createReportTaskDTO: ReportTaskInput,
    @Param('userId') userId: string,
    @Param('planningPeriodId') planningPeriodId: string,
    @Headers('tenantId') tenantId: string,
    @Query('planningId') planningId?: string,
  ) {
    return this.okrReportTaskService.create(
      createReportTaskDTO,
      tenantId,
      planningPeriodId,
      userId,
      planningId,
    );
  }

  @Get('/users/:userId/planning-period/:planningPeriodId')
  getAllUnReportedTasks(
    @Param('planningPeriodId') planningPeriodId: string,
    @Param('userId') userId: string,
    @Headers('tenantId') tenantId: string,
    @Query('forPlan') forPlan: string,
  ) {
    return this.okrReportTaskService.getUnReportedPlanTasks(
      userId,
      planningPeriodId,
      tenantId,
      forPlan,
    );
  }

  @Post('/by-planning-period/:planningPeriodId') 
  async getAllReportTasks(
    @Body() userIds: string[], // Expecting userIds to be an array of strings
    @Headers('tenantId') tenantId: UUID, // Expecting tenantId from headers
    @Param('planningPeriodId') planningPeriodId: string, // Extract the planningPeriodId from the route
  ): Promise<any> {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    return this.okrReportTaskService.findAllReportTasks(
      tenantId,
      userIds,
      planningPeriodId,
    );
  }

  @Patch('/update-report-tasks/:reportId') 
  async updateReportData(
    @Body() reportTask: ReportTaskInput, 
    @Param('reportId') reportId: string, 
  ): Promise<any> {
    return this.okrReportTaskService.updateReportTasks(reportId, reportTask);
  }
  @Delete(':id')
  async deleteReport(
    @Param('id') id: string,
    @Headers('tenantId') tenantId: UUID,
  ): Promise<any> {
    return this.okrReportTaskService.deleteReportTasks(id);
  }
}
