import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlanTasksService } from './plan-tasks.service';
import { CreatePlanTaskDto } from './dto/create-plan-task.dto';
import { UpdatePlanTaskDto } from './dto/update-plan-task.dto';

@Controller('plan-tasks')
export class PlanTasksController {
  constructor(private readonly planTasksService: PlanTasksService) {}

  @Post()
  create(@Body() createPlanTaskDto: CreatePlanTaskDto) {
    return this.planTasksService.create(createPlanTaskDto);
  }

  @Get()
  findAll() {
    return this.planTasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planTasksService.findOne(+id);
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
