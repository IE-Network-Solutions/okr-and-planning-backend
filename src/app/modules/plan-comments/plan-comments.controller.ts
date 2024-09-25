import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanCommentsService } from './plan-comments.service';
import { CreatePlanCommentDto } from './dto/create-plan-comment.dto';
import { UpdatePlanCommentDto } from './dto/update-plan-comment.dto';

@Controller('plan-comments')
export class PlanCommentsController {
  constructor(private readonly planCommentsService: PlanCommentsService) {}

  @Post()
  create(@Body() createPlanCommentDto: CreatePlanCommentDto) {
    return this.planCommentsService.create(createPlanCommentDto);
  }

  @Get()
  findAll() {
    return this.planCommentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planCommentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanCommentDto: UpdatePlanCommentDto) {
    return this.planCommentsService.update(+id, updatePlanCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planCommentsService.remove(+id);
  }
}
