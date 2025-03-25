import { Body, Controller, Get, Post, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WeeklyPrioritiesWeekService } from './weekly-priorities-week.service';
import { WeeklyPriorityWeekDto } from './dto/weekly-priority-week.dto';

@ApiTags('weekly-priorities-week')
@Controller('weekly-priorities-week')
export class WeeklyPrioritiesWeekController {
  constructor(
    private readonly weeklyPrioritiesWeekService: WeeklyPrioritiesWeekService,
  ) {}

  @Get()
  async findAll(@Headers('tenantId') tenantId: string) {
    return this.weeklyPrioritiesWeekService.findAll();
  }

  @Post()
  async create(
    @Body() createWeeklyPriorityDto: WeeklyPriorityWeekDto,
    @Headers('tenantId') tenantId: string,
  ) {
    return this.weeklyPrioritiesWeekService.create(createWeeklyPriorityDto);
  }
}
