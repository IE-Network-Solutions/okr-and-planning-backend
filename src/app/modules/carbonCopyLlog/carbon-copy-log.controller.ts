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
import { CreateCarbonCopyLogDto } from './dto/create-carbon-copy-log.dto';
import { UpdateCarbonCopyLogDto } from './dto/update-carbon-copy-log.dto';
import { CarbonCopyLogService } from './carbon-copy-log.service';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

@Controller('carbon-copy-log')
export class CarbonCopyLogController {
  constructor(private readonly carbonCopyLogService: CarbonCopyLogService) {}

  @Post()
  create(
    @Body() createCarbonCopyLogDto: CreateCarbonCopyLogDto,

    @Req() req: Request,
  ) {
    const tenantId = req['tenantId'];
    return this.carbonCopyLogService.create(createCarbonCopyLogDto, tenantId);
  }

  @Get()
  findAll(
    @Query() options: IPaginationOptions,
    @Query('orderBy') orderBy = 'id',
    @Query('orderDirection') orderDirection: 'ASC' | 'DESC' = 'DESC',
    @Req() req: Request,
  ) {
    const tenantId = req['tenantId'];
    return this.carbonCopyLogService.findAll(
      options,
      orderBy,
      orderDirection,
      tenantId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carbonCopyLogService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCarbonCopyLogDto: UpdateCarbonCopyLogDto,
  ) {
    return this.carbonCopyLogService.update(id, updateCarbonCopyLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carbonCopyLogService.remove(id);
  }
}
