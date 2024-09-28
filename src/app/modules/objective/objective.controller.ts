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
} from '@nestjs/common';
import { ObjectiveService } from './objective.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { Objective } from './entities/objective.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { ApiTags } from '@nestjs/swagger';
import { FilterObjectiveDto } from './dto/filter-objective.dto';

@Controller('objective')
@ApiTags('Objective')
export class ObjectiveController {
  constructor(private readonly objectiveService: ObjectiveService) {}

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
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    return this.objectiveService.findAllObjectives(
      userId,
      tenantId,
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
  calculateUSerOkr(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    const token = req['token'];
    return this.objectiveService.handleUserOkr(
      userId,
      tenantId,
      token,
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
}
