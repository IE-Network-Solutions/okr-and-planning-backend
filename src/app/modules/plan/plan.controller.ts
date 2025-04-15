import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
  Headers,
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
    @Headers('sessionId') sessionId?: string,
  ): Promise<Plan> {
    const tenantId = req['tenantId'];
    return await this.planService.create(createPlanDto, tenantId, sessionId);
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
    @Headers('tenantId') tenantId: string,
    @Headers('sessionId') sessionId?: string,
   
  ): Promise<Plan[]> {
    return await this.planService.findAllUsersPlans(
      tenantId,
      userId,
      planningPeriodId,
      forPlan,
      sessionId,
    );
  }

  @Get()
  async findAllPlansByUserId(
    @Headers('sessionId') sessionId?: string,
  ) {
    return await this.planService.findAll(sessionId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('sessionId') sessionId?: string,
  ): Promise<Plan> {
    return await this.planService.findOne(id);
  }

  @Post('/users/:planningPeriodId')
  async findByUsers(
    @Query() options: IPaginationOptions,
    @Param('planningPeriodId') id: string,
    @Body() arrayOfUserId: string[],
    @Req() req: Request,
    @Headers('sessionId') sessionId?: string,
  ) {
    const tenantId = req['tenantId'];
    return await this.planService.findPlansByUsersAndPlanningPeriodId(
      id,
      arrayOfUserId,
      options,
      tenantId,
      sessionId,
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
