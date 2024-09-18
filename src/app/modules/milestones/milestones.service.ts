import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { Repository } from 'typeorm';
import { Milestone } from './entities/milestone.entity';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class MilestonesService {
  constructor(
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    private readonly paginationService: PaginationService,
  ) {}
  async createMilestone(
    createMilestoneDto: CreateMilestoneDto,
    tenantId: string,
  ): Promise<Milestone> {
    const milestone = this.milestoneRepository.create({
      ...createMilestoneDto,
      tenantId,
    });
    return await this.milestoneRepository.save(milestone);
  }
  async createBulkMilestone(
    createMilestoneDto: CreateMilestoneDto[],
    tenantId: string,
    keyResultId: string,
  ) {
    try {
      const keyResults = await Promise.all(
        createMilestoneDto.map(async (mile) => {
          mile.keyResultId = keyResultId;
          const singleKeyResult = await this.createMilestone(mile, tenantId);
        }),
      );

      return keyResults;
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }

  async findAllMilestones(
    paginationOptions: PaginationDto,
    tenantId: string,
  ): Promise<Pagination<Milestone>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      const paginatedData = await this.paginationService.paginate<Milestone>(
        this.milestoneRepository,
        'Milestone',
        options,
        paginationOptions.orderBy,
        paginationOptions.orderDirection,
        { tenantId },
      );

      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneMilestone(id: string): Promise<Milestone> {
    try {
      const Milestone = await this.milestoneRepository.findOneByOrFail({ id });
      return Milestone;
    } catch (error) {
      throw new NotFoundException(`Milestone with Id ${id} not found`);
    }
  }

  async updateMilestone(
    id: string,
    updateMilestoneDto: UpdateMilestoneDto,
  ): Promise<Milestone> {
    const Milestone = await this.findOneMilestone(id);
    if (!Milestone) {
      throw new NotFoundException(`Milestone with id ${id} not found`);
    }

    await this.milestoneRepository.update(
      { id },

      updateMilestoneDto,
    );

    return await this.findOneMilestone(id);
  }

  async removeMilestone(id: string): Promise<Milestone> {
    const Milestone = await this.findOneMilestone(id);
    if (!Milestone) {
      throw new NotFoundException(`Milestone with Id ${id} not found`);
    }
    await this.milestoneRepository.softRemove({ id });
    return Milestone;
  }
}
