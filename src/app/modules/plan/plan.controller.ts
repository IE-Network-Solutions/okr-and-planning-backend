import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('plan')
@ApiTags('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() createPlanDto: CreatePlanDto,
  ): Promise<Plan> {
    const tenantId = req['tenantId'];
    return await this.planService.create(createPlanDto, tenantId);
  }

  @Post('validate/:planId')
  async validate(
    @Req() req: Request,
    @Param('planId') planId: string,
  ): Promise<Plan> {
    const tenantId = req['tenantId'];
    return await this.planService.validate(planId, tenantId);
  }

  @Post('open/:planId')
  async open(
    @Req() req: Request,
    @Param('planId') planId: string,
  ): Promise<Plan> {
    const tenantId = req['tenantId'];
    return await this.planService.open(planId, tenantId);
  }

  @Get()
  async findAll() {
    return await this.planService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Plan> {
    return await this.planService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return await this.planService.update(+id, updatePlanDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.planService.remove(+id);
  }
}
