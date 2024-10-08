import { Controller, Get, Param, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashbaordService: DashboardService) {}

  @Get(':id')
  findAllApreciationAndRepremands(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const tenantId = req['tenantId'];
    return this.dashbaordService.findAllDashbaordData(id, tenantId);
  }
}
