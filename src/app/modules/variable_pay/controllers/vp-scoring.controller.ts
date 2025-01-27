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
import { ApiTags } from '@nestjs/swagger';
import { VpScoringService } from '../services/vp-scoring.service';
import { CreateVpScoringDto } from '../dtos/vp-scoring-dto/create-vp-scoring.dto';
import { VpScoring } from '../entities/vp-scoring.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { UpdateVpScoringDto } from '../dtos/vp-scoring-dto/update-vp-scoring.dto';

@Controller('vp-scoring')
@ApiTags('vp-scoring')
export class VpScoringController {
  constructor(private readonly vpScoringService: VpScoringService) {}

  @Post()
  async createVpScoring(
    @Body() createVpScoringDto: CreateVpScoringDto,
    @Headers('tenantId') tenantId: string,
  ): Promise<VpScoring> {
    return await this.vpScoringService.createVpScoring(
      createVpScoringDto,
      tenantId,
    );
  }

  @Get('')
  async findAllVpScorings(
    @Headers('tenantId') tenantId: string,
    @Query() paginationOptions?: PaginationDto,
  ) {
    return this.vpScoringService.findAllVpScorings(tenantId, paginationOptions);
  }

  @Get(':id')
  findOneVpScoring(@Param('id') id: string) {
    return this.vpScoringService.findOneVpScoring(id);
  }

  @Put(':id')
  updateVpScoring(
    @Headers('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateVpScoringDto: UpdateVpScoringDto,
  ) {
    return this.vpScoringService.updateVpScoring(
      id,
      updateVpScoringDto,
      tenantId,
    );
  }

  @Delete(':id')
  removeVpScoring(
    @Headers('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.vpScoringService.removeVpScoring(id);
  }
}
