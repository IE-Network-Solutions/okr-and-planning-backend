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
  Put,
} from '@nestjs/common';
import { CriteriaTargetService } from '../services/criteria-target.service';
import { CreateCriteriaTargetDto } from '../dtos/criteria-target-dto/create-criteria-target.dto';
import { UpdateCriteriaTargetDto } from '../dtos/criteria-target-dto/update-criteria-target.dto';
import { ApiTags } from '@nestjs/swagger';
import { CriteriaTarget } from '../entities/criteria-target.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { CreateCriteriaTargetForMultipleDto } from '../dtos/criteria-target-dto/create-vp-criteria-bulk-dto';
import { UpdateCriteriaTargetForMultipleDto } from '../dtos/criteria-target-dto/update-vp-criteria-bulk-dto';

@Controller('criteria-targets')
@ApiTags('criteria-target')
export class CriteriaTargetController {
  constructor(private readonly criteriaTargetService: CriteriaTargetService) {}

  @Post()
  async createCriteriaTarget(
    @Body() createCriteriaTargetDto: CreateCriteriaTargetForMultipleDto,
    @Headers('tenantId') tenantId: string,
  ): Promise<CriteriaTarget[]> {
    return await this.criteriaTargetService.createCriteriaTarget(
      createCriteriaTargetDto,
      tenantId,
    );
  }

  @Get('')
  async findAllCriteriaTargets(
    @Headers('tenantId') tenantId: string,
    @Query() paginationOptions?: PaginationDto,
  ) {
    return this.criteriaTargetService.findAllCriteriaTargets(
      tenantId,
      paginationOptions,
    );
  }

  @Get(':id')
  findOneCriteriaTarget(@Param('id') id: string) {
    return this.criteriaTargetService.findOneCriteriaTarget(id);
  }

  @Put(':id')
  updateCriteriaTarget(
    @Headers('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateCriteriaTargetDto: UpdateCriteriaTargetDto,
  ) {
    return this.criteriaTargetService.updateCriteriaTarget(
      id,
      updateCriteriaTargetDto,
      tenantId,
    );
  }
  @Put('/bulk/:id')
  updateCriteriaTargetBulk(
    @Headers('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateCriteriaTargetDto: UpdateCriteriaTargetForMultipleDto,
  ) {
    return this.criteriaTargetService.updateCriteriaTargetBulk(
      id,
      updateCriteriaTargetDto,
      tenantId,
    );
  }
  @Delete(':id')
  removeCriteriaTarget(
    @Headers('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.criteriaTargetService.removeCriteriaTarget(id);
  }
}
