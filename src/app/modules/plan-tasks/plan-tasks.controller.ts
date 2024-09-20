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
import { PlanTasksService } from './plan-tasks.service';
import { UpdatePlanTaskDto } from './dto/update-plan-task.dto';
import { PlanTask } from './entities/plan-task.entity';
import { Plan } from '../plan/entities/plan.entity';
import { ApiTags } from '@nestjs/swagger';
import { CreatePlanTasksDto } from './dto/create-plan-tasks.dto';

@Controller('plan-tasks')
@ApiTags('plan-tasks')
export class PlanTasksController {
  constructor(private readonly planTasksService: PlanTasksService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() createPlanTaskDto: CreatePlanTasksDto,
  ): Promise<Plan[]> {
    const tenantId = req['tenantId'];
    return await this.planTasksService.create(createPlanTaskDto, tenantId);
  }

  @Get()
  async findAll(@Req() req: Request): Promise<Plan[]> {
    const tenantId = req['tenantId'];
    return await this.planTasksService.findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Plan[]> {
    return await this.planTasksService.findOne(id);
  }

  @Get('/user/:id')
  async findByUser(@Param('id') id: string): Promise<Plan[]> {
    return await this.planTasksService.findByUser(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlanTaskDto: UpdatePlanTaskDto,
  ) {
    return this.planTasksService.update(+id, updatePlanTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planTasksService.remove(+id);
  }
}
