import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Objective } from './entities/objective.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { KeyResultsService } from '../key-results/key-results.service';
import { MilestonesService } from '../milestones/milestones.service';
import { CreateKeyResultDto } from '../key-results/dto/create-key-result.dto';
import { CreateMilestoneDto } from '../milestones/dto/create-milestone.dto';

@Injectable()
export class ObjectiveService {
  constructor(
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,

    private readonly paginationService: PaginationService,
    private readonly keyResultService: KeyResultsService, // private readonly milestoneService: MilestonesService, //   @InjectDataSource() private dataSource: DataSource,
  ) {}
  async createObjective(
    createObjectiveDto: CreateObjectiveDto,
    tenantId: string,
  ): Promise<Objective> {
    try {
      const objective = await this.objectiveRepository.create({
        ...createObjectiveDto,
        tenantId,
      });
      const savedObjective = await this.objectiveRepository.save(objective);
      await this.keyResultService.createkeyBulkResult(
        createObjectiveDto.keyResult,
        tenantId,
        savedObjective.id,
      );
      return savedObjective;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAllObjectives(
    paginationOptions: PaginationDto,
    tenantId: string,
  ): Promise<Pagination<Objective>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      const paginatedData = await this.paginationService.paginate<Objective>(
        this.objectiveRepository,
        'objective',
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

  async findOneObjective(id: string): Promise<Objective> {
    try {
      const Objective = await this.objectiveRepository.findOne({
        where: { id: id },
        relations: ['keyResults', 'keyResults.milestones'],
      });
      return Objective;
    } catch (error) {
      throw new NotFoundException(`Objective Not Found`);
    }
  }

  async updateObjective(
    id: string,
    updateObjectiveDto: UpdateObjectiveDto,
  ): Promise<Objective> {
    const Objective = await this.findOneObjective(id);
    if (!Objective) {
      throw new NotFoundException(`Objective Not Found`);
    }

    await this.objectiveRepository.update(
      { id },

      updateObjectiveDto,
    );

    return await this.findOneObjective(id);
  }

  async removeObjective(id: string): Promise<Objective> {
    const objective = await this.findOneObjective(id);
    if (!objective) {
      throw new NotFoundException(`Objective Not Found`);
    }
    await this.objectiveRepository.softRemove({ id });
    return objective;
  }
}
