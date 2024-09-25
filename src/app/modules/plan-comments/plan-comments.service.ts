import { Injectable } from '@nestjs/common';
import { CreatePlanCommentDto } from './dto/create-plan-comment.dto';
import { UpdatePlanCommentDto } from './dto/update-plan-comment.dto';

@Injectable()
export class PlanCommentsService {
  create(createPlanCommentDto: CreatePlanCommentDto) {
    return 'This action adds a new planComment';
  }

  findAll() {
    return `This action returns all planComments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} planComment`;
  }

  update(id: number, updatePlanCommentDto: UpdatePlanCommentDto) {
    return `This action updates a #${id} planComment`;
  }

  remove(id: number) {
    return `This action removes a #${id} planComment`;
  }
}
