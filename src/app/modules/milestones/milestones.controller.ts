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
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { Milestone } from './entities/milestone.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('milestones')
@ApiTags('milestone')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  async createMilestone(
    @Req() req: Request,
    @Body() createMilestonesDto: CreateMilestoneDto,
  ): Promise<Milestone> {
    const tenantId = req['tenantId'];
    return await this.milestonesService.createMilestone(
      createMilestonesDto,
      tenantId,
    );
  }

  @Get()
  async findAllMilestones(
    @Req() req: Request,
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    return this.milestonesService.findAllMilestones(
      paginationOptions,
      tenantId,
    );
  }

  @Get(':id')
  findOneMilestone(@Param('id') id: string) {
    return this.milestonesService.findOneMilestone(id);
  }

  @Patch(':id')
  updateMilestone(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateMilestonesDto: UpdateMilestoneDto,
  ) {
    return this.milestonesService.updateMilestone(id, updateMilestonesDto);
  }

  @Delete(':id')
  removeMilestone(@Req() req: Request, @Param('id') id: string) {
    return this.milestonesService.removeMilestone(id);
  }
}
