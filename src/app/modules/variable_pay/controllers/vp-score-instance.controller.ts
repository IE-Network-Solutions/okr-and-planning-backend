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
  Req,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { VpScoreInstance } from '../entities/vp-score-instance.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { VpScoreInstanceService } from '../services/vp-score-instance.service';
import { CreateVpScoreInstanceDto } from '../dtos/vp-score-instance-dto/create-vp-score-instance.dto';
import { UpdateVpScoreInstanceDto } from '../dtos/vp-score-instance-dto/update-vp-score-instance.dto';
import { VpScoreTargetFilterDto } from '../dtos/vp-score-instance-dto/vp-filter-dto';
import { VpScoreFilterDto } from '../dtos/vp-score-instance-dto/vp-score-filter';

@Controller('vp-score-instance')
@ApiTags('vp-score-instance')
export class VpScoreInstanceController {
  constructor(
    private readonly vpScoreInstanceService: VpScoreInstanceService,
  ) {}

  @Post()
  async createVpScoreInstance(
    @Body() createVpScoreInstanceDto: CreateVpScoreInstanceDto,
    @Headers('tenantId') tenantId: string,
  ): Promise<VpScoreInstance> {
    return await this.vpScoreInstanceService.createVpScoreInstance(
      createVpScoreInstanceDto,
      tenantId,
    );
  }

  @Get('/filter')
  async findAllVpScoreInstances(
    @Headers('tenantId') tenantId: string,
    @Query() vpScoreFilterDto: VpScoreFilterDto,
    @Query() paginationOptions?: PaginationDto,
  ) {
    return this.vpScoreInstanceService.findAllVpScoreInstances(
      tenantId,
      vpScoreFilterDto,
      paginationOptions,
    );
  }

  @Get(':id')
  findOneVpScoreInstance(@Param('id') id: string) {
    return this.vpScoreInstanceService.findOneVpScoreInstance(id);
  }
  @Get('/by-user/:userId')
  findOneVpScoreInstanceOfUserScore(
    @Param('userId') userId: string,
    @Headers('tenantId') tenantId: string,
    @Req() request: any,
  ) {
    const token = request.token;
    return this.vpScoreInstanceService.findOneVpScoreInstanceOfUserScore(
      userId,
      tenantId,
    );
  }
  @Get('/score/:userId')
  findOneVpScoreInstanceOfUser(
    @Param('userId') userId: string,
    @Headers('tenantId') tenantId: string,
  ) {
    return this.vpScoreInstanceService.findOneVpScoreInstanceOfUser(
      userId,
      tenantId,
    );
  }

  @Put(':id')
  updateVpScoreInstance(
    @Headers('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateVpScoreInstanceDto: UpdateVpScoreInstanceDto,
  ) {
    return this.vpScoreInstanceService.updateVpScoreInstance(
      id,
      updateVpScoreInstanceDto,
      tenantId,
    );
  }

  @Post('/score/target')
  findOneVpScoreInstanceOfUserTarget(
    @Body() vpScoreTargetFilterDto: VpScoreTargetFilterDto,
    @Headers('tenantId') tenantId: string,
  ) {
    return this.vpScoreInstanceService.findOneVpScoreInstanceOfUserTarget(
      tenantId,
      vpScoreTargetFilterDto,
    );
  }

  @Delete(':id')
  removeVpScoreInstance(
    @Headers('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.vpScoreInstanceService.removeVpScoreInstance(id);
  }
}
