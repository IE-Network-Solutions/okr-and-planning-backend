import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { PlanningPeriodsService } from './planning-periods.service';
import { CreatePlanningPeriodsDTO } from './dto/create-planningPeriods.dto';
import { PlanningPeriod } from './entities/planningPeriod.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ApiTags } from '@nestjs/swagger';

@Controller('planningPeriods')
@ApiTags('PlanningPeriods')
export class PlanningPeriodsController {
  constructor(private readonly planningPeriodService: PlanningPeriodsService) {}
  @Post()
  async createPlanningPeriod(
    @Req() req: Request,
    @Body() createPlanningPeriodsDto: CreatePlanningPeriodsDTO,
  ): Promise<PlanningPeriod> {
    const tenantId = req['tenantId'];
    return await this.planningPeriodService.createPlanningPeriods(
      createPlanningPeriodsDto,
      tenantId,
    );
  }

  @Get()
  async findAllPlanningPeriods(
    @Req() req: Request,
    @Query()
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<PlanningPeriod>> {
    const tenantId = req['tenantId'];
    return await this.planningPeriodService.findAllPlanningPeriods(
      paginationOptions,
      tenantId,
    );
  }

  @Get(':id')
  async findOnePlanningPeriod(
    @Param('id') id: string,
  ): Promise<PlanningPeriod> {
    return await this.planningPeriodService.findOnePlanningPeriod(id);
  }

  @Patch(':id')
  async updatePlanningPeriod(
    @Param('id') id: string,
    @Body() createPlanningPeriodsDto: CreatePlanningPeriodsDTO,
  ): Promise<PlanningPeriod> {
    return await this.planningPeriodService.updatePlanningPeriod(
      id,
      createPlanningPeriodsDto,
    );
  }

  @Delete(':id')
  async removePlanningPeriod(@Param('id') id: string): Promise<PlanningPeriod> {
    return await this.planningPeriodService.removePlanningPeriod(id);
  }
}
