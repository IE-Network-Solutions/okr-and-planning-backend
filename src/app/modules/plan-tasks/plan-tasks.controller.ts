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
import { Plan } from '../plan/entities/plan.entity';
import { ApiTags } from '@nestjs/swagger';
import { UpdatePlanTasksDto } from './dto/update-plan-tasks.dto';
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
    return await this.planTasksService.create(
      createPlanTaskDto.tasks,
      tenantId,
    );
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

  @Get('/user/:id/:planningId')
  async findByUser(
    @Param('id') id: string,
    @Param('planningId') planningId: string,
  ): Promise<Plan[]> {
    return await this.planTasksService.findByUser(id, planningId);
  }

  @Post('/users/:planningId')
  async findByUsers(
    @Param('planningId') id: string,
    @Body() arrayOfUserId: string[],
  ): Promise<Plan[]> {
    return await this.planTasksService.findByUsers(id, arrayOfUserId);
  }
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlanTaskDto: UpdatePlanTasksDto,
  ): Promise<Plan[]> {
    return this.planTasksService.update(id, updatePlanTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planTasksService.remove(+id);
  }
}
