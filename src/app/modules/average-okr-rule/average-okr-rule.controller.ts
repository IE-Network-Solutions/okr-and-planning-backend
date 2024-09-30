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
import { AverageOkrRuleService } from './average-okr-rule.service';
import { CreateAverageOkrRuleDto } from './dto/create-average-okr-rule.dto';
import { UpdateAverageOkrRuleDto } from './dto/update-average-okr-rule.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { AverageOkrRule } from './entities/average-okr-rule.entity';

@Controller('average-okr-rule')
export class AverageOkrRuleController {
  constructor(private readonly averageOkrRuleService: AverageOkrRuleService) {}
  @Post()
  async createAverageOkrRule(
    @Req() req: Request,
    @Body() createAverageOkrRuleDto: CreateAverageOkrRuleDto,
  ): Promise<AverageOkrRule> {
    const tenantId = req['tenantId'];
    return await this.averageOkrRuleService.createAverageOkrRule(
      createAverageOkrRuleDto,
      tenantId,
    );
  }

  @Get()
  async findAllAverageOkrRules(
    @Req() req: Request,
    @Query() paginationOptions?: PaginationDto,
  ) {
    const tenantId = req['tenantId'];
    return this.averageOkrRuleService.findAllAverageOkrRules(
      paginationOptions,
      tenantId,
    );
  }

  @Get(':id')
  findOneAverageOkrRule(@Param('id') id: string) {
    return this.averageOkrRuleService.findOneAverageOkrRule(id);
  }

  @Patch(':id')
  updateAverageOkrRule(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateAverageOkrRuleDto: UpdateAverageOkrRuleDto,
  ) {
    return this.averageOkrRuleService.updateAverageOkrRule(
      id,
      updateAverageOkrRuleDto,
    );
  }

  @Delete(':id')
  removeAverageOkrRule(@Req() req: Request, @Param('id') id: string) {
    return this.averageOkrRuleService.removeAverageOkrRule(id);
  }
}
