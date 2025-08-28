import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CheckInRuleService } from '../services/check-in-rule.service';
import { CreateCheckInRuleDto } from '../dto/create-check-in-rule.dto';
import { UpdateCheckInRuleDto } from '../dto/update-check-in-rule.dto';

import {
  ApiCreateCheckInRule,
  ApiGetCheckInRules,
  ApiUpdateCheckInRule,
  ApiDeleteCheckInRule,
} from '../decorators';

@ApiTags('Check-in Rules')
@Controller('check-in-rules')
export class CheckInRuleController {
  constructor(private readonly checkInRuleService: CheckInRuleService) {}

  @Post()
  @ApiCreateCheckInRule()
  async create(@Body() createCheckInRuleDto: CreateCheckInRuleDto) {
    return this.checkInRuleService.create(createCheckInRuleDto);
  }

  @Get()
  @ApiGetCheckInRules()
  async findAll(@Query('tenantId') tenantId: string) {
    return this.checkInRuleService.findAll(tenantId);
  }



  @Patch(':id')
  @ApiUpdateCheckInRule()
  async update(
    @Param('id') id: string,
    @Body() updateCheckInRuleDto: UpdateCheckInRuleDto,
    @Query('tenantId') tenantId: string,
  ) {
    return this.checkInRuleService.update(id, updateCheckInRuleDto, tenantId);
  }

  @Delete(':id')
  @ApiDeleteCheckInRule()
  async remove(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.checkInRuleService.remove(id, tenantId);
  }
} 