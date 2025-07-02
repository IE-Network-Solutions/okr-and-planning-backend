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
  Patch,
  Res,
} from '@nestjs/common';
import { ObjectiveService } from './services/objective.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { Objective } from './entities/objective.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FilterObjectiveDto } from './dto/filter-objective.dto';
import { OKRDashboardService } from './services/okr-dashbord.service';
import { ExcludeAuthGuard } from '@root/src/core/guards/exclud.guard';
import { OKRCalculationService } from './services/okr-calculation.service';
import { UpdateObjectiveStatusDto } from './dto/update-objective-status.dto';
import { FilterObjectiveOfAllEmployeesDto } from './dto/filter-objective-byemployees.dto';
import { FilterVPRecognitionDTo } from '../variable_pay/dtos/vp-score-instance-dto/filter-vp-recognition.dto';

@Controller('objective')
@ApiTags('Objective')
export class ObjectiveController {
  constructor(
    private readonly objectiveService: ObjectiveService,
    private readonly okrDashboardService: OKRDashboardService,
    private readonly oKRCalculationService: OKRCalculationService,
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

  /**
   * Get team members OKR visibility based on user role
   * Team leads see all their team members and child department members' OKRs
   * Regular users only see their own OKR
   */


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

  @Get('/objective-filter/all/objective')
  objectiveAll(
    @Req() req: Request,
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    return this.objectiveService.objectiveFilterWithoutUser(
      tenantId,
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
    return this.oKRCalculationService.okrOfUser(
      userId,
      tenantId,
      paginationOptions,
    );
  }

  @Post('/supervisor-okr')
 
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
    return this.okrDashboardService.okrOfTheCompany(
      tenantId,
      paginationOptions,
    );
  }

  @Get('/user/:userId')
  async calculateUSerOkr(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    return this.oKRCalculationService.handleUserOkr(
      userId,
      tenantId,
      paginationOptions,
    );
  }

  @Patch('/update-status')
  async updateObjectiveStatusForAllUsers(
    @Req() req: Request,

    @Body() updateObjectiveStatusDto?: UpdateObjectiveStatusDto,
  ) {
    const tenantId = req['tenantId'];
    return this.objectiveService.updateObjectiveStatusForAllUsers(
      updateObjectiveStatusDto,
      tenantId,
    );
  }
  @Post('/get-okr-progress/all-employees')
  async getAllEmployeesOkrProgress(
    @Headers('tenantId') tenantId: string,

    @Body() filterObjectiveOfAllEmployeesDto: FilterObjectiveOfAllEmployeesDto,
    @Query() paginationOptions?: PaginationDto,
  ) {
    return this.oKRCalculationService.getAllEmployeesOkrProgress(
      tenantId,
      filterObjectiveOfAllEmployeesDto,
      paginationOptions,
    );
  }

  @Post('/export-okr-progress/all-employees/export')
  async exportAllEmployeesOkrProgress(
    @Headers('tenantId') tenantId: string,
    @Res() res: Response,
    @Body() filterObjectiveOfAllEmployeesDto: FilterObjectiveOfAllEmployeesDto,
    @Query() paginationOptions?: PaginationDto,
  ) {
    return this.oKRCalculationService.exportAllEmployeesOkrProgress(
      res,
      tenantId,
      filterObjectiveOfAllEmployeesDto,
      paginationOptions,
    );
  }

    @Post('/get-okr-score/to-recognize/all-employees/score')
  async getOkrScoreInTimeRange(
  
     @Headers('tenantId') tenantId: string,
       @Body() filterVpRecognitionDTo: FilterVPRecognitionDTo,
  ) {
      return this.oKRCalculationService.getOkrScoreInTimeRange(
      filterVpRecognitionDTo,
      tenantId,
  
    );
  }
}
