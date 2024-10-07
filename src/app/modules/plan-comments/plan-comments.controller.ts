import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PlanCommentsService } from './plan-comments.service';
import { CreatePlanCommentDto } from './dto/create-plan-comment.dto';
import { UpdatePlanCommentDto } from './dto/update-plan-comment.dto';
import { PlanComment } from './entities/plan-comment.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('plan-comments')
@ApiTags('plan-comments')
export class PlanCommentsController {
  constructor(private readonly planCommentsService: PlanCommentsService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() createPlanCommentDto: CreatePlanCommentDto,
  ): Promise<PlanComment> {
    const tenantId = req['tenantId'];
    return await this.planCommentsService.create(
      createPlanCommentDto,
      tenantId,
    );
  }

  @Get()
  findAll() {
    return this.planCommentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.planCommentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlanCommentDto: UpdatePlanCommentDto,
  ) {
    return await this.planCommentsService.update(id, updatePlanCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.planCommentsService.remove(id);
  }
}
