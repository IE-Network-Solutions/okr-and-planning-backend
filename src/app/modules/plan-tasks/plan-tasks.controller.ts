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
  ): Promise<Plan> {
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
  async findOne(@Param('id') id: string): Promise<Plan> {
    return await this.planTasksService.findOne(id);
  }

  @Get('get-reported-plan-tasks/by-plan-id/:id')
  async findReportedPlanTasks(@Param('id') id: string): Promise<PlanTask[]> {
    return await this.planTasksService.findReportedPlanTasks(id);
  }

  // url: `${OKR_URL}/plan-tasks/un-reported-plan-tasks/${userId}/planning-period/${planningPeriodId}`,

  @Get('/user/:id/:planningId')
  async findByUser(
    @Param('id') id: string,
    @Param('planningId') planningId: string,
  ): Promise<Plan[]> {
    return await this.planTasksService.findByUser(id, planningId);
  }

  @Get(
    'planned-data/un-reported-plan-tasks/:userId/planning-period/:planningPeriodId',
  )
  async findAllUnreportedTasks(
    @Param('userId') userId: string,
    @Param('planningPeriodId') planningPeriodId: string,
    @Req() req: Request,
  ): Promise<PlanTask[]> {
    const tenantId = req['tenantId'];
    return await this.planTasksService.findAllUnreportedTasks(
      userId,
      planningPeriodId,
      tenantId,
    );
  }
  @Post('/users/:planningId')
  async findByUsers(
    @Query() options: IPaginationOptions,
    @Param('planningId') id: string,
    @Body() arrayOfUserId: string[],
  ) {
    return await this.planTasksService.findByUsers(id, arrayOfUserId, options);
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
  ): Promise<any> {
    const tenantId = req['tenantId'];
    return this.planTasksService.updateTasks(updatePlanTaskDto.tasks, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planTasksService.remove(id);
  }
}
