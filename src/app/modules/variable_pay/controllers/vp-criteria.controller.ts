import { Controller, Get, Post, Body, Patch, Param, Delete, Headers, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VpCriteriaService } from '../services/vp-criteria.service';
import { CreateVpCriteriaDto } from '../dtos/vp-criteria-dto/create-vp-criteria.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { UpdateVpCriteriaDto } from '../dtos/vp-criteria-dto/update-vp-criteria.dto';
import { VpCriteria } from '../entities/vp-criteria.entity';


@Controller('vp-criteria')
@ApiTags('vp-criteria')
export class VpCriteriaController {
  constructor(
    private readonly vpCriteriaService: VpCriteriaService,
  ) {}

  @Post()
  async createVpCriteria(
    @Body() createVpCriteriaDto: CreateVpCriteriaDto,
    @Headers('tenantId') tenantId: string,
  ): Promise<VpCriteria> {
    return await this.vpCriteriaService.createVpCriteria(
      createVpCriteriaDto,
      tenantId,
    );
  }

  @Get('')
  async findAllVpCriteria(
    @Headers('tenantId') tenantId: string,
    @Query() paginationOptions?: PaginationDto,
  ) {
    
    return this.vpCriteriaService.findAllVpCriteria(
      tenantId,
      paginationOptions,
    );
  }

  @Get(':id')
  findOneVpCriteria(@Param('id') id: string) {
    return this.vpCriteriaService.findOneVpCriteria(id);
  }

  @Put(':id')
  updateVpCriteria(
    @Headers('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateVpCriteriaDto: UpdateVpCriteriaDto,
  ) {
    return this.vpCriteriaService.updateVpCriteria(
      id,
      updateVpCriteriaDto,
      tenantId,
    );
  }
  @Delete(':id')
  removeVpCriteria(@Headers('tenantId') tenantId: string, @Param('id') id: string) {
    return this.vpCriteriaService.removeVpCriteria(id);
  }
}
