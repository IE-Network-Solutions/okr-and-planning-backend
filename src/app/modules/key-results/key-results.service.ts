import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { KeyResult } from './entities/key-result.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { MilestonesService } from '../milestones/milestones.service';

@Injectable()
export class KeyResultsService {
  constructor(
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    private readonly paginationService: PaginationService,
    private readonly milestonesService: MilestonesService,
  ) {}
  async createkeyResult(
    createkeyResultDto: CreateKeyResultDto,
    tenantId: string,
  ): Promise<KeyResult> {
    const keyResult = await this.keyResultRepository.create({
      ...createkeyResultDto,
      tenantId,
    });
    return await this.keyResultRepository.save(keyResult);
  }

  async createkeyBulkResult(
    createkeyResultDto: CreateKeyResultDto[],
    tenantId: string,
    objectiveId: string,
  ) {
    const keyResults = await Promise.all(
      createkeyResultDto.map(async (key) => {
        key.objectiveId = objectiveId;
        const singleKeyResult = await this.createkeyResult(key, tenantId);
        await this.milestonesService.createBulkMilestone(
          key.milestones,
          tenantId,
          singleKeyResult.id,
        );
      }),
    );

    return keyResults;
  }

  async findAllkeyResults(
    paginationOptions: PaginationDto,
    tenantId: string,
  ): Promise<Pagination<KeyResult>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      const paginatedData = await this.paginationService.paginate<KeyResult>(
        this.keyResultRepository,
        'keyResult',
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

  async findOnekeyResult(id: string): Promise<KeyResult> {
    try {
      const keyResult = await this.keyResultRepository.findOneByOrFail({ id });
      return keyResult;
    } catch (error) {
      throw new NotFoundException(`keyResult with Id ${id} not found`);
    }
  }

  async updatekeyResult(
    id: string,
    updatekeyResultDto: UpdateKeyResultDto,
  ): Promise<KeyResult> {
    const keyResult = await this.findOnekeyResult(id);
    if (!keyResult) {
      throw new NotFoundException(`keyResult with id ${id} not found`);
    }
    await this.keyResultRepository.update(
      { id },

      updatekeyResultDto,
    );

    return await this.findOnekeyResult(id);
  }

  async removekeyResult(id: string): Promise<KeyResult> {
    const keyResult = await this.findOnekeyResult(id);
    if (!keyResult) {
      throw new NotFoundException(`keyResult with Id ${id} not found`);
    }
    await this.keyResultRepository.softRemove({ id });
    return keyResult;
  }
}
