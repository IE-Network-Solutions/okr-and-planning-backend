import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { Connection, QueryRunner, Repository } from 'typeorm';
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
    private readonly connection: Connection, // Inject the database connection
  ) {}
  async createMilestone(
    createMilestoneDto: CreateMilestoneDto,
    tenantId: string,
    queryRunner?: QueryRunner,
  ): Promise<Milestone> {
    try {
      const milestone = queryRunner
        ? queryRunner.manager.create(Milestone, {
            ...createMilestoneDto,
            tenantId,
          })
        : this.milestoneRepository.create({
            ...createMilestoneDto,
            tenantId,
          });
      return queryRunner
        ? await queryRunner.manager.save(Milestone, milestone)
        : await this.milestoneRepository.save(milestone);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async createBulkMilestone(
    createMilestoneDto: CreateMilestoneDto[],
    tenantId: string,
    keyResultId: string,
    userId: string,
    queryRunner?: QueryRunner,
  ) {
    try {
      const keyResults = await Promise.all(
        createMilestoneDto.map(async (mile) => {
          mile.keyResultId = keyResultId;
          mile['createdBy'] = userId;
          const singleKeyResult = await this.createMilestone(
            mile,
            tenantId,
            queryRunner,
          );
        }),
      );

      return keyResults;
    } catch (error) {
      throw new BadRequestException(error.message);
    } finally {
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

  async updateMilestones(
    updateMilestoneDto: UpdateMilestoneDto[],
    tenantId: string,
    keyResultId?: string,
  ): Promise<Milestone[]> {
    const milestones = await Promise.all(
      updateMilestoneDto.map(async (mile) => {
        if (!mile.id) {
          const milestoneTobeCreated = new CreateMilestoneDto();
          milestoneTobeCreated.title = mile.title;
          milestoneTobeCreated.description = mile.description;
          milestoneTobeCreated.weight = mile.weight;
          milestoneTobeCreated.keyResultId = keyResultId;
          milestoneTobeCreated.status = mile.status;

          await this.createMilestone(milestoneTobeCreated, tenantId);
        }

        return await this.updateMilestone(mile.id, mile);
      }),
    );

    return milestones;
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
