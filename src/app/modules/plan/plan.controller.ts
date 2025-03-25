import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { Plan } from './entities/plan.entity';
import { ApiTags } from '@nestjs/swagger';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { query } from 'express';

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
    @Query('value') value: string,
  ): Promise<Plan> {
    const tenantId = req['tenantId'];
    return await this.planService.validate(planId, tenantId, value);
  }

  @Post('open/:planId')
  async open(
    @Req() req: Request,
    @Param('planId') planId: string,
  ): Promise<Plan> {
    const tenantId = req['tenantId'];
    return await this.planService.open(planId, tenantId);
  }

  @Get('find-all-plans/users/:userId/planning-period/:planningPeriodId')
  async findAll(
    @Param('userId') userId: string,
    @Param('planningPeriodId') planningPeriodId: string,
    @Query('forPlan') forPlan: string,
  ): Promise<Plan[]> {
    return await this.planService.findAllUsersPlans(
      userId,
      planningPeriodId,
      forPlan,
    );
  }

  @Get()
  async findAllPlansByUserId() {
    return await this.planService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Plan> {
    return await this.planService.findOne(id);
  }

  @Post('/users/:planningPeriodId')
  async findByUsers(
    @Query() options: IPaginationOptions,
    @Param('planningPeriodId') id: string,
    @Body() arrayOfUserId: string[],
    @Req() req: Request,
  ) {
    const tenantId = req['tenantId'];
    return await this.planService.findPlansByUsersAndPlanningPeriodId(
      id,
      arrayOfUserId,
      options,
      tenantId,
    );
  }
  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
  //   return await this.planService.update(+id, updatePlanDto);
  // }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.planService.remove(id);
  }
}
