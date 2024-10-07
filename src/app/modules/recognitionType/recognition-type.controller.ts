import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { RecognitionTypeService } from './recognition-type.service';
import { CreateRecognitionTypeDto } from './dto/create-recognition-type.dto';
import { UpdateRecognitionTypeDto } from './dto/update-recognition-type.dto';
import { RecognitionType } from './entities/recognition-type.entity';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { FilterRecognitionTypeDto } from './dto/filter.recognition-type.dto';

@Controller('recognition-type')
export class RecognitionTypeController {
  constructor(
    private readonly recognitionTypeService: RecognitionTypeService,
  ) {}

  @Post()
  async create(
    @Body() createRecognitionTypeDto: CreateRecognitionTypeDto,
    @Req() req: Request,
  ): Promise<RecognitionType> {
    const tenantId = req['tenantId'];
    return this.recognitionTypeService.create(
      createRecognitionTypeDto,
      tenantId,
    );
  }

  @Get()
  async findAll(
    @Query() options: IPaginationOptions,
    @Query('orderBy') orderBy = 'createdAt',
    @Query('orderDirection') orderDirection: 'ASC' | 'DESC' = 'DESC',
    @Req() req: Request,
    @Query() filterDto?: FilterRecognitionTypeDto,
  ) {
    const tenantId = req['tenantId'];
    return this.recognitionTypeService.findAll(
      options,
      orderBy,
      orderDirection,
      tenantId,
      filterDto,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RecognitionType> {
    return this.recognitionTypeService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRecognitionTypeDto: UpdateRecognitionTypeDto,
  ): Promise<RecognitionType> {
    return this.recognitionTypeService.update(id, updateRecognitionTypeDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.recognitionTypeService.remove(id);
  }
}
