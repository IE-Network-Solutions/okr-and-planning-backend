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
import { KeyResultsService } from './key-results.service';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { KeyResult } from './entities/key-result.entity';

@Controller('key-results')
export class KeyResultsController {
  constructor(private readonly keyResultService: KeyResultsService) {}

  @Post()
  async createkeyResult(
    @Req() req: Request,
    @Body() createkeyResultDto: CreateKeyResultDto,
  ): Promise<KeyResult> {
    const tenantId = req['tenantId'];
    return await this.keyResultService.createkeyResult(
      createkeyResultDto,
      tenantId,
    );
  }

  @Get()
  async findAllkeyResults(
    @Req() req: Request,
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    return this.keyResultService.findAllkeyResults(paginationOptions, tenantId);
  }

  @Get(':id')
  findOnekeyResult(@Param('id') id: string) {
    return this.keyResultService.findOnekeyResult(id);
  }

  @Patch(':id')
  updatekeyResult(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatekeyResultDto: UpdateKeyResultDto,
  ) {
    return this.keyResultService.updatekeyResult(id, updatekeyResultDto);
  }

  @Delete(':id')
  removekeyResult(@Req() req: Request, @Param('id') id: string) {
    return this.keyResultService.removekeyResult(id);
  }
}
