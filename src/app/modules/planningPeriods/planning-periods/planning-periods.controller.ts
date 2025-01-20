import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { PlanningPeriodsService } from './planning-periods.service';
import { CreatePlanningPeriodsDTO } from './dto/create-planningPeriods.dto';
import { PlanningPeriod } from './entities/planningPeriod.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ApiTags } from '@nestjs/swagger';
import { PlanningPeriodUser } from './entities/planningPeriodUser.entity';
import { AssignUsersDTO } from './dto/assignUser.dto';

import { ExcludeAuthGuard } from '@root/src/core/guards/exclud.guard';

import { UUID } from 'crypto';
import { PlannnigPeriodUserDto } from './dto/planningPeriodUser.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { IsUUID } from 'class-validator';

class ParamsWithUUID {
  @IsUUID()
  planningPeriodId: string;

  @IsUUID()
  userId: string;
}
@Controller('planning-periods')
@ApiTags('Planning-periods')
export class PlanningPeriodsController {
  constructor(private readonly planningPeriodService: PlanningPeriodsService) {}
  @Post()
  @ExcludeAuthGuard()
  async createPlanningPeriod(
    @Req() req: Request,
    @Body() createPlanningPeriodsDto: CreatePlanningPeriodsDTO,
  ): Promise<PlanningPeriod> {
    const tenantId = req['tenantId'];
    return await this.planningPeriodService.createPlanningPeriods(
      createPlanningPeriodsDto,
      tenantId,
    );
  }
  async createPlanningPeriodUser(
    @Req() req: Request,
    @Body() createPlanningPeriodsDto: CreatePlanningPeriodsDTO,
  ): Promise<PlanningPeriod> {
    const tenantId = req['tenantId'];
    return await this.planningPeriodService.createPlanningPeriods(
      createPlanningPeriodsDto,
      tenantId,
    );
  }

  @Get()
  async findAllPlanningPeriods(
    @Req() req: Request,
    @Query()
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<PlanningPeriod>> {
    const tenantId = req['tenantId'];
    return await this.planningPeriodService.findAllPlanningPeriods(
      paginationOptions,
      tenantId,
    );
  }

  @Get(':id')
  async findOnePlanningPeriod(
    @Param('id') id: string,
  ): Promise<PlanningPeriod> {
    return await this.planningPeriodService.findOnePlanningPeriod(id);
  }

  @Patch(':id')
  async updatePlanningPeriod(
    @Param('id') id: string,
    @Body() createPlanningPeriodsDto: CreatePlanningPeriodsDTO,
  ): Promise<PlanningPeriod> {
    return await this.planningPeriodService.updatePlanningPeriod(
      id,
      createPlanningPeriodsDto,
    );
  }

  @Delete(':id')
  @ExcludeAuthGuard()
  async removePlanningPeriod(@Param('id') id: string): Promise<PlanningPeriod> {
    return await this.planningPeriodService.removePlanningPeriod(id);
  }

  @Delete('planning-user/:id')
  @ExcludeAuthGuard()
  async removePlanningPeriodUser(
    @Param('id') id: string,
  ): Promise<PlanningPeriodUser[]> {
    return await this.planningPeriodService.removePlanningPeriodUsersByUserId(
      id,
    );
  }

  @Post('/assignUser')
  async assignUser(
    @Req() req: Request,
    @Body() assignUserDto: AssignUsersDTO,
  ): Promise<PlanningPeriodUser> {
    const tenantId = req['tenantId'];
    return await this.planningPeriodService.assignUser(assignUserDto, tenantId);
  }

  @Post('/assignUser-multiple-planning-periods')
  async assignUserMultiplePlannigPeriods(
    @Req() req: Request,
    @Body() plannnigPeriodUserDto: PlannnigPeriodUserDto,
  ) {
    const tenantId = req['tenantId'];
    return await this.planningPeriodService.assignMultiplePlanningPeriodForMultipleUsers(
      plannnigPeriodUserDto,
      tenantId,
    );
  }

  @Patch('update-users-assigned-planning-periods/:id')
  async UpdatePlanningPeriod(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() plannnigPeriodUserDto: PlannnigPeriodUserDto,
  ): Promise<PlanningPeriodUser[]> {
    const tenantId = req['tenantId'];
    return await this.planningPeriodService.updateMultiplePlanningPeriodUser(
      id,
      plannnigPeriodUserDto,
      tenantId,
    );
  }

  @Get('/assignment/getAssignedUsers')
  async findAssignedUser(
    @Req() req: Request,
    @Query()
    paginationOptions: PaginationDto,
    @Query()
    filterUSerDto?: FilterUserDto,
  ): Promise<Pagination<PlanningPeriodUser>> {
    const tenantId = req['tenantId'];
    return await this.planningPeriodService.findAll(
      tenantId,
      paginationOptions,
      filterUSerDto,
    );
  }

  @Get('assignment/assignedUser/:userId')
  async findByUser(
    @Param('userId') id: string,
  ): Promise<PlanningPeriodUser[]> {
    return await this.planningPeriodService.findByUser(id);
  }

  @Get('assignment/assignedPeriod/:periodId')
  async findByPeriod(
    @Param('periodId') id: string,
    @Query()
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<PlanningPeriodUser>> {
    return await this.planningPeriodService.findByPeriod(paginationOptions, id);
  }

  @Patch('assignment/assignedUser/update/:id')
  async UpdateAssignment(
    @Param('userId') id: string,
    @Body() assignUserDto: AssignUsersDTO,
  ): Promise<PlanningPeriodUser[]> {
    return await this.planningPeriodService.updatePlanningPeriodUser(
      id,
      assignUserDto,
    );
  }
  @Get('update/planning-period/status/:id')
  async updatePlanningPeriodStatus(
    @Param('id') id: string,
  ): Promise<PlanningPeriod> {
    return await this.planningPeriodService.updatePlanningPeriodStatus(id);
  }

  @Get('parent-hierarchy/:planningPeriodId/user/:userId')
  async getPlanningPeriodParentHierarchy(
    @Req() req: Request,
    @Param() params: ParamsWithUUID,
  ): Promise<PlanningPeriod> {
    const { planningPeriodId, userId } = params;
    const tenantId = req['tenantId'];

    return await this.planningPeriodService.getPlanningPeriodParentHierarchy(planningPeriodId, userId,tenantId);
  }


  @Get('child-hierarchy/:planningPeriodId/user/:userId')
  async getPlanningChildPeriodHierarchy(
    @Param() params: ParamsWithUUID,
  ): Promise<PlanningPeriod> {
    const { planningPeriodId, userId } = params;
  
    return await this.planningPeriodService.getPlanningPeriodChildHierarchy(planningPeriodId, userId);
  }


}
