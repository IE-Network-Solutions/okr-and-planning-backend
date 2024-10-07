import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Req,
  Put,
} from '@nestjs/common';
import { CreateReprimandDto } from './dto/create-reprimand.dto';
import { UpdateReprimandDto } from './dto/update-reprimand.dto';
import { ReprimandLogService } from './setrvices/reprimand-log.service';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { FilterReprimandLogDto } from './dto/filter.reprimand-log.dto';

@Controller('reprimand-log')
export class ReprimandLogController {
  constructor(private readonly reprimandService: ReprimandLogService) {}

  @Post()
  create(@Body() createReprimandDto: CreateReprimandDto, @Req() req: Request) {
    const tenantId = req['tenantId'];
    return this.reprimandService.create(createReprimandDto, tenantId);
  }

  @Get()
  findAll(
    @Query() options: IPaginationOptions,
    @Query('orderBy') orderBy = 'id',
    @Query('orderDirection') orderDirection: 'ASC' | 'DESC' = 'DESC',
    @Req() req: Request,
    @Query() filterDto: FilterReprimandLogDto,
  ) {
    const tenantId = req['tenantId'];
    return this.reprimandService.findAll(
      options,
      orderBy,
      orderDirection,
      tenantId,
      filterDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reprimandService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateReprimandDto: UpdateReprimandDto,
  ) {
    return this.reprimandService.update(id, updateReprimandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reprimandService.remove(id);
  }
}
