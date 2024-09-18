import { Injectable } from '@nestjs/common';
import { CreatePlanTaskDto } from './dto/create-plan-task.dto';
import { UpdatePlanTaskDto } from './dto/update-plan-task.dto';

@Injectable()
export class PlanTasksService {
  create(createPlanTaskDto: CreatePlanTaskDto) {
    return 'This action adds a new planTask';
  }

  findAll() {
    return `This action returns all planTasks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} planTask`;
  }

  update(id: number, updatePlanTaskDto: UpdatePlanTaskDto) {
    return `This action updates a #${id} planTask`;
  }

  remove(id: number) {
    return `This action removes a #${id} planTask`;
  }
}
