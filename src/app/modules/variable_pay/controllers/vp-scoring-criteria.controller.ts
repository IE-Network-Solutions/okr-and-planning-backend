import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Put,
  Query,
} from '@nestjs/common';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { VpScoringCriterion } from '../entities/vp-scoring-criterion.entity';
import { VpScoringCriteriaService } from '../services/vp-scoring-criteria.service';
import { CreateVpScoringCriterionDto } from '../dtos/vp-scoring-criteria-dto/create-vp-scoring-criterion.dto';
import { UpdateVpScoringCriterionDto } from '../dtos/vp-scoring-criteria-dto/update-vp-scoring-criterion.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('vp-scoring-criteria')
@ApiTags('vp-scoring-criteria')
export class VpScoringCriteriaController {
  constructor(
    private readonly vpScoringCriteriaService: VpScoringCriteriaService,
  ) {}

  @Post()
  async createVpScoringCriteria(
    @Body() createVpScoringCriteriaDto: CreateVpScoringCriterionDto,
    @Headers('tenantId') tenantId: string,
  ): Promise<VpScoringCriterion> {
    return await this.vpScoringCriteriaService.createVpScoringCriterion(
      createVpScoringCriteriaDto,
      tenantId,
    );
  }

  @Get('')
  async findAllVpScoringCriterion(
    @Headers('tenantId') tenantId: string,
    @Query() paginationOptions?: PaginationDto,
  ) {
    return this.vpScoringCriteriaService.findAllVpScoringCriterions(
      tenantId,
      paginationOptions,
    );
  }

  @Get(':id')
  findOneVpScoringCriterion(@Param('id') id: string) {
    return this.vpScoringCriteriaService.findOneVpScoringCriterion(id);
  }

  @Put(':id')
  updateVpScoringCriteria(
    @Headers('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateVpScoringCriteriaDto: UpdateVpScoringCriterionDto,
  ) {
    return this.vpScoringCriteriaService.updateVpScoringCriterion(
      id,
      updateVpScoringCriteriaDto,
      tenantId,
    );
  }

  @Delete(':id')
  removeVpScoringCriteria(
    @Headers('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.vpScoringCriteriaService.removeVpScoringCriterion(id);
  }
}
