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
  Headers,
} from '@nestjs/common';
import { PlanTasksService } from './plan-tasks.service';
import { Plan } from '../plan/entities/plan.entity';
import { ApiTags } from '@nestjs/swagger';
import { UpdatePlanTasksDto } from './dto/update-plan-tasks.dto';
import { CreatePlanTasksDto } from './dto/create-plan-tasks.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { PlanTask } from './entities/plan-task.entity';

@Controller('plan-tasks')
@ApiTags('plan-tasks')
export class PlanTasksController {
  constructor(private readonly planTasksService: PlanTasksService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() createPlanTaskDto: CreatePlanTasksDto,
    @Headers('sessionId') sessionId?: string,
  ): Promise<Plan> {
    const tenantId = req['tenantId'];
    return await this.planTasksService.create(
      createPlanTaskDto.tasks,
      tenantId,
      sessionId,
    );
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Headers('sessionId') sessionId?: string,
  ): Promise<Plan[]> {
    const tenantId = req['tenantId'];
    return await this.planTasksService.findAll(tenantId, sessionId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Plan> {
    return await this.planTasksService.findOne(id);
  }

  @Get('get-reported-plan-tasks/by-plan-id/:id')
  async findReportedPlanTasks(
    @Param('id') id: string,
    @Req() req: Request,
    @Headers('sessionId') sessionId?: string,
  ): Promise<PlanTask[]> {
    const tenantId = req['tenantId'];
    return await this.planTasksService.findReportedPlanTasks(id, tenantId,sessionId);
  }

  @Get('/user/:id/:planningId')
  async findByUser(
    @Param('id') id: string,
    @Param('planningId') planningId: string,
    @Headers('sessionId') sessionId?: string,
  ): Promise<Plan[]> {
    return await this.planTasksService.findByUser(id, planningId, sessionId);
  }

  @Get(
    'failed-plan-of-planning-period/:planningPeriodId/:userId',
  )
  async findAllFailedPlannedTasksByPlanningPeriod(
    @Param('planningPeriodId') planningPeriodId: string,
    @Param('userId') userId: string,
    @Req() req: Request,
    @Headers('sessionId') sessionId?: string,
  ): Promise<PlanTask[]> {
    const tenantId = req['tenantId'];
    return await this.planTasksService.findAllFailedPlannedTasksByPlanningPeriod(
      planningPeriodId,
      tenantId,
      userId,
      sessionId,
    );
  }
  @Get(
    'planned-data/un-reported-plan-tasks/:userId/planning-period/:planningPeriodId',
  )
  async findAllUnreportedTasks(
    @Param('userId') userId: string,
    @Param('planningPeriodId') planningPeriodId: string,
    @Req() req: Request,
    @Headers('sessionId') sessionId?: string,
  ): Promise<PlanTask[]> {
    const tenantId = req['tenantId'];
    return await this.planTasksService.findAllUnreportedTasks(
      userId,
      planningPeriodId,
      tenantId,
      sessionId,
    );
  }

  @Post('/users/:planningId')
  async findByUsers(
    @Query() options: IPaginationOptions,
    @Param('planningId') id: string,
    @Body() arrayOfUserId: string[],
    @Req() req: Request,
    @Headers('sessionId') sessionId?: string,
  ) {
    const tenantId = req['tenantId'];
    return await this.planTasksService.findByUsers(
      id,
      arrayOfUserId,
      options,
      tenantId,
      sessionId,
    );
  }

  @Patch()
  async update(
    @Body() updatePlanTaskDto: UpdatePlanTasksDto,
    @Req() req: Request,
  ): Promise<any> {
    const tenantId = req['tenantId'];
    return this.planTasksService.updateTasks(updatePlanTaskDto.tasks, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planTasksService.remove(id);
  }
}
