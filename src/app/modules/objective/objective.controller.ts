import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
  Put,
  Headers,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ObjectiveService } from './services/objective.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { Objective } from './entities/objective.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { ApiTags } from '@nestjs/swagger';
import { FilterObjectiveDto } from './dto/filter-objective.dto';
import { OKRDashboardService } from './services/okr-dashbord.service';
import { ExcludeAuthGuard } from '@root/src/core/guards/exclud.guard';

@Controller('objective')
@ApiTags('Objective')
export class ObjectiveController {
  constructor(
    private readonly objectiveService: ObjectiveService,
    private readonly okrDashboardService: OKRDashboardService,
  ) {}

  @Post()
  async createObjective(
    @Req() req: Request,
    @Body() createObjectiveDto: CreateObjectiveDto,
  ): Promise<Objective> {
    const tenantId = req['tenantId'];
    return await this.objectiveService.createObjective(
      createObjectiveDto,
      tenantId,
    );
  }

  @Get(':userId')
  async findAllObjectives(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Query() filterDto?: FilterObjectiveDto,
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    return this.objectiveService.findAllObjectives(
      userId,
      tenantId,
      filterDto,
      paginationOptions,
    );
  }

  @Get(':id')
  findOneObjective(@Param('id') id: string) {
    return this.objectiveService.findOneObjective(id);
  }

  @Put(':id')
  updateObjective(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateObjectiveDto: UpdateObjectiveDto,
  ) {
    const tenantId = req['tenantId'];
    return this.objectiveService.updateObjective(
      id,
      updateObjectiveDto,
      tenantId,
    );
  }

  @Delete(':id')
  removeObjective(@Req() req: Request, @Param('id') id: string) {
    return this.objectiveService.removeObjective(id);
  }

  @Get('/user/:userId')
  async calculateUSerOkr(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    return this.okrDashboardService.handleUserOkr(
      userId,
      tenantId,
      paginationOptions,
    );
  }
  @Get('/objective-filter')
  objectiveFilter(
    @Req() req: Request,
    @Body() filterDto?: FilterObjectiveDto,
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    return this.objectiveService.objectiveFilter(
      tenantId,
      filterDto,
      paginationOptions,
    );
  }

  @Post('/team')
  @ExcludeAuthGuard()
  getTeamOkr(
    @Req() req: Request,
    @Body() filterDto?: FilterObjectiveDto,
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    return this.objectiveService.getTeamOkr(
      tenantId,
      filterDto,
      paginationOptions,
    );
  }
  @Post('/company/okr/:userId')
  @ExcludeAuthGuard()
  getCompanyOkr(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Body() filterDto?: FilterObjectiveDto,
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    return this.objectiveService.getCompanyOkr(
      tenantId,
      userId,
      filterDto,
      paginationOptions,
    );
  }

  @Post('/single-user-okr')
  @ExcludeAuthGuard()
  getOkrOfSingleUser(
    @Headers('tenantId') tenantId: string,
    @Headers('userId') userId: string,
    @Query() paginationOptions?: PaginationDto,
  ) {
    return this.okrDashboardService.getOkrOfSingleUser(
      userId,
      tenantId,
      paginationOptions,
    );
  }

  @Post('/supervisor-okr')
  @ExcludeAuthGuard()
  getOkrOfSupervisor(
    @Headers('tenantId') tenantId: string,
    @Headers('userId') userId: string,
    @Query() paginationOptions?: PaginationDto,
  ) {
    return this.okrDashboardService.getOkrOfSupervisor(
      userId,
      tenantId,
      paginationOptions,
    );
  }

  @Post('/team-okr')
  @ExcludeAuthGuard()
  getOkrOfTeam(
    @Headers('tenantId') tenantId: string,
    @Headers('userId') userId: string,
    @Query() paginationOptions?: PaginationDto,
  ) {
    return this.okrDashboardService.getOkrOfTeam(
      userId,
      tenantId,
      paginationOptions,
    );
  }

  @Post('/company-okr')
  @ExcludeAuthGuard()
  getCompanyOkrOnVP(
    @Headers('tenantId') tenantId: string,
    @Headers('userId') userId: string,
    @Query() paginationOptions?: PaginationDto,
  ) {
    return this.objectiveService.getCompanyOkr(
      tenantId,
      userId,
      null,
      paginationOptions,
    );
  }
}
