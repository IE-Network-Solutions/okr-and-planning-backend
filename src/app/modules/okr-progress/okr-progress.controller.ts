import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OkrProgressService } from './okr-progress.service';
import { CreateOkrProgressDto } from './dto/create-okr-progress.dto';
import { UpdateOkrProgressDto } from './dto/update-okr-progress.dto';

@Controller('okr-progress')
export class OkrProgressController {
  constructor(private readonly okrProgressService: OkrProgressService) {}

  @Post()
  create(@Body() createOkrProgressDto: CreateOkrProgressDto) {
    return this.okrProgressService.create(createOkrProgressDto);
  }

  @Get()
  findAll() {
    return this.okrProgressService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.okrProgressService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOkrProgressDto: UpdateOkrProgressDto) {
    return this.okrProgressService.update(+id, updateOkrProgressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.okrProgressService.remove(+id);
  }
}
