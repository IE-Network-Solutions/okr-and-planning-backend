import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { MetricTypesService } from './metric-types.service';
import { CreateMetricTypeDto } from './dto/create-metric-type.dto';
import { UpdateMetricTypeDto } from './dto/update-metric-type.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { MetricType } from './entities/metric-type.entity';
import { ExcludeAuthGuard } from '@root/src/core/guards/exclud.guard';

@Controller('metric-types')
export class MetricTypesController {
  constructor(private readonly metricTypesService: MetricTypesService) {}

  @Post()
  @ExcludeAuthGuard()
  async createMetricType(
    @Req() req: Request,
    @Body() createMetricTypeDto: CreateMetricTypeDto,
  ): Promise<MetricType> {
    const tenantId = req['tenantId'];
    return await this.metricTypesService.createMetricType(
      createMetricTypeDto,
      tenantId,
    );
  }

  @Get()
  async findAllMetricTypes(
    @Req() req: Request,
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    return this.metricTypesService.findAllMetricTypes(
      paginationOptions,
      tenantId,
    );
  }

  @Get(':id')
  findOneMetricType(@Param('id') id: string) {
    return this.metricTypesService.findOneMetricType(id);
  }

  @Patch(':id')
  updateMetricType(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateMetricTypeDto: UpdateMetricTypeDto,
  ) {
    return this.metricTypesService.updateMetricType(id, updateMetricTypeDto);
  }

  @Delete(':id')
  @ExcludeAuthGuard()
  removeMetricType(@Req() req: Request, @Param('id') id: string) {
    return this.metricTypesService.removeMetricType(id);
  }
}
