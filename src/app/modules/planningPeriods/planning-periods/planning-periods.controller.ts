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
} from '@nestjs/common';
import { PlanningPeriodsService } from './planning-periods.service';
import { CreatePlanningPeriodsDTO } from './dto/create-planningPeriods.dto';
import { PlanningPeriod } from './entities/planningPeriod.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { PlanningPeriodUser } from './entities/planningPeriodUser.entity';
import { AssignUsersDTO } from './dto/assignUser.dto';
import { UUID } from 'crypto';

@Controller('planning-periods')
@ApiTags('Planning-periods')
export class PlanningPeriodsController {
  constructor(private readonly planningPeriodService: PlanningPeriodsService) {}
  @Post()
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
  async removePlanningPeriod(@Param('id') id: string): Promise<PlanningPeriod> {
    return await this.planningPeriodService.removePlanningPeriod(id);
  }

  @Post('/assignUser')
  async assignUser(
    @Req() req: Request,
    @Body() assignUserDto: AssignUsersDTO,
  ): Promise<PlanningPeriodUser> {
    const tenantId = req['tenantId'];
    return await this.planningPeriodService.assignUser(assignUserDto, tenantId);
  }

  @Get('/assignment/getAssignedUsers')
  async findAssignedUser(
    @Req() req: Request,
    @Query()
    paginationOptions: PaginationDto,
  ): Promise<Pagination<PlanningPeriodUser>> {
    const tenantId = req['tenantId'];
    return await this.planningPeriodService.findAll(
      paginationOptions,
      tenantId,
    );
  }

  @Get('assignment/assignedUser/:userId')
  @ApiHeader({
    name: 'tenantId',
    description: 'Tenant ID for the current request',
    required: true,
  })
  async findByUser(
    @Param('userId') id: string,
    @Headers('tenantId') tenantId: UUID,
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
}
