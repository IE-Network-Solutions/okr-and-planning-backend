import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Query,
} from '@nestjs/common';
import { WeeklyPrioritiesService } from './weekly-priorities-task.service';
import { CreateWeeklyPriorityDto } from './dto/create-weekly-priority-task.dto';
import { UpdateWeeklyPriorityDto } from './dto/update-weekly-priority-task.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { ApiTags } from '@nestjs/swagger';
import { FilterWeeklyPriorityDto } from './dto/filter-weekly-priority-task.dto';

@ApiTags('weekly-priorities')
@Controller('weekly-priorities')
export class WeeklyPrioritiesController {
  constructor(
    private readonly weeklyPrioritiesService: WeeklyPrioritiesService,
  ) {}

  @Post('/create')
  async create(
    @Body() createWeeklyPriorityDto: CreateWeeklyPriorityDto,
    @Headers('tenantId') tenantId: string,
  ) {
    return this.weeklyPrioritiesService.create(
      createWeeklyPriorityDto,
      tenantId,
    );
  }

  @Post()
  async findAll(
    @Headers('tenantId') tenantId: string,
    @Body() filterWeeklyPriorityDto: FilterWeeklyPriorityDto,
    @Query() paginationOptions?: PaginationDto,
  ) {
    return this.weeklyPrioritiesService.findAll(tenantId, paginationOptions, filterWeeklyPriorityDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWeeklyPriorityDto: UpdateWeeklyPriorityDto,
  ) {
    return this.weeklyPrioritiesService.update(id, updateWeeklyPriorityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weeklyPrioritiesService.remove(id);
  }
}
