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
  async findOne(
    @Param('id') id: string,
    @Headers('sessionId') sessionId?: string,
  ): Promise<Plan> {
    return await this.planTasksService.findOne(id, sessionId);
  }

  @Get('get-reported-plan-tasks/by-plan-id/:id')
  async findReportedPlanTasks(
    @Param('id') id: string,
    @Headers('sessionId') sessionId?: string,
  ): Promise<PlanTask[]> {
    return await this.planTasksService.findReportedPlanTasks(id, sessionId);
  }

  // url: `${OKR_URL}/plan-tasks/un-reported-plan-tasks/${userId}/planning-period/${planningPeriodId}`,

  @Get('/user/:id/:planningId')
  async findByUser(
    @Param('id') id: string,
    @Param('planningId') planningId: string,
    @Headers('sessionId') sessionId?: string,
  ): Promise<Plan[]> {
    return await this.planTasksService.findByUser(id, planningId, sessionId);
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
    @Headers('sessionId') sessionId?: string,
  ) {
    return await this.planTasksService.findByUsers(id, arrayOfUserId, options, sessionId);
  }
  // @Post('/users-plan/:planningId')
  // async findByUserIds(
  //   @Query() options: IPaginationOptions,
  //   @Param('planningId') id: string,
  //   @Body() arrayOfUserId: string[],
  // ) {
  //   return await this.planTasksService.findByUserIds(id, arrayOfUserId, options);
  // }
  @Patch()
  async update(
    @Body() updatePlanTaskDto: UpdatePlanTasksDto,
    @Req() req: Request,
    @Headers('sessionId') sessionId?: string,
  ): Promise<any> {
    const tenantId = req['tenantId'];
    return this.planTasksService.updateTasks(updatePlanTaskDto.tasks, tenantId, sessionId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('sessionId') sessionId?: string,
  ) {
    return this.planTasksService.remove(id, sessionId);
  }
}
