import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanCommentDto } from './dto/create-plan-comment.dto';
import { UpdatePlanCommentDto } from './dto/update-plan-comment.dto';
import { PlanComment } from './entities/plan-comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Plan } from '../plan/entities/plan.entity';

@Injectable()
export class PlanCommentsService {
  constructor(
    @InjectRepository(PlanComment)
    private planCommentRepository: Repository<PlanComment>,
    @InjectRepository(Plan)
    private planRepository: TreeRepository<Plan>,
  ) {}
  async create(
    createPlanCommentDto: CreatePlanCommentDto,
    tenantId: string,
  ): Promise<PlanComment> {
    try {
      const id = createPlanCommentDto.planId;
      const plan = await this.planRepository.findOneByOrFail({ id });
      if (!plan) {
        throw new NotFoundException('The associated plan could not be found');
      }
      const comment = await this.planCommentRepository.create({
        ...createPlanCommentDto,
        tenantId: tenantId,
      });
      return await this.planCommentRepository.save(comment);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Unable to create the comment. Please check your information and try again.');
      }
      throw error;
    }
  }

  async findAll() {
    return `This action returns all planComments`;
  }

  async findOne(id: string) {
    try {
      return await this.planCommentRepository.findOneByOrFail({ id });
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Unable to create the comment. Please check your information and try again.');
      }
      throw error;
    }
  }

  async update(id: string, updatePlanCommentDto: UpdatePlanCommentDto) {
    try {
      const previous = await this.planCommentRepository.findOneByOrFail({ id });
      if (!previous) {
        throw new NotFoundException('The previous comment could not be found');
      }
      const updatedComment = await this.planCommentRepository.update(
        previous.id,
        updatePlanCommentDto,
      );
      if (!updatedComment) {
        throw new NotFoundException(
          `The comment you are trying to update with ID ${id} can not be completed`,
        );
      }
      return await this.findOne(previous.id);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Unable to update the comment. Please check your information and try again.');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const previous = await this.planCommentRepository.findOneByOrFail({ id });
      if (!previous) {
        throw new NotFoundException('Error while deleting the comment');
      }
      return await this.planCommentRepository.softRemove({ id });
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('Unable to delete the comment. Please try again later.');
      }
    }
  }
}
