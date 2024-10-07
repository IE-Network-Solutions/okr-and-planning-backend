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
  Put,
} from '@nestjs/common';
import { AppreciationService } from './appreciation-log.service';
import { CreateAppreciationDto } from './dto/create-appreciation.dto';
import { UpdateAppreciationDto } from './dto/update-appreciation.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { FilterAppreciationLogDto } from './dto/filter.appreciation-log.dto';

@Controller('appreciation-log')
export class AppreciationController {
  constructor(private readonly appreciationService: AppreciationService) {}

  @Post()
  create(
    @Body() createAppreciationDto: CreateAppreciationDto,
    @Req() req: Request,
  ) {
    const tenantId = req['tenantId'];
    return this.appreciationService.create(createAppreciationDto, tenantId);
  }

  @Get()
  findAll(
    @Query() options: IPaginationOptions,
    @Query('orderBy') orderBy = 'id',
    @Query('orderDirection') orderDirection: 'ASC' | 'DESC' = 'DESC',
    @Req() req: Request,
    @Query() filterDto: FilterAppreciationLogDto,
  ) {
    const tenantId = req['tenantId'];
    return this.appreciationService.findAll(
      options,
      orderBy,
      orderDirection,
      tenantId,
      filterDto,
    );
  }
  @Get('all')
  findAllApreciationAndRepremands(
    @Query() options: IPaginationOptions,
    @Query('orderBy') orderBy = 'id',
    @Query('orderDirection') orderDirection: 'ASC' | 'DESC' = 'DESC',
    @Req() req: Request,
    @Query() filterDto?: FilterAppreciationLogDto,
  ) {
    const tenantId = req['tenantId'];
    return this.appreciationService.findAllAppreciationAndRepremandLogs(
      options,
      orderBy,
      orderDirection,
      tenantId,
      filterDto,
    );
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appreciationService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppreciationDto: UpdateAppreciationDto,
  ) {
    return this.appreciationService.update(id, updateAppreciationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appreciationService.remove(id);
  }
}
