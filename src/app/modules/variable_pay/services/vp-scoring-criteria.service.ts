import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VpScoringCriterion } from '../entities/vp-scoring-criterion.entity';
import { QueryRunner, Repository } from 'typeorm';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { CreateVpScoringCriterionDto } from '../dtos/vp-scoring-criteria-dto/create-vp-scoring-criterion.dto';
import { UpdateVpScoringCriterionDto } from '../dtos/vp-scoring-criteria-dto/update-vp-scoring-criterion.dto';
import { PaginationService } from '@root/src/core/pagination/pagination.service';

@Injectable()
export class VpScoringCriteriaService {
  constructor(
    @InjectRepository(VpScoringCriterion)
    private vpScoringCriterionRepository: Repository<VpScoringCriterion>,
    private readonly paginationService: PaginationService,
  ) {}
  async createVpScoringCriterion(
    createVpScoringCriterionDto: CreateVpScoringCriterionDto,
    tenantId: string,
    queryRunner?: QueryRunner,
  ): Promise<VpScoringCriterion> {
    try {
      const createdVpScoringCriterion = queryRunner
        ? queryRunner.manager.create(VpScoringCriterion, {
            ...createVpScoringCriterionDto,
            tenantId,
          })
        : this.vpScoringCriterionRepository.create({
            ...createVpScoringCriterionDto,
            tenantId,
          });
      const savedVpScoringCriterion = queryRunner
        ? await queryRunner.manager.save(
            VpScoringCriterion,
            createdVpScoringCriterion,
          )
        : await this.vpScoringCriterionRepository.save(
            createdVpScoringCriterion,
          );

      return savedVpScoringCriterion;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async findAllVpScoringCriterions(
    tenantId: string,
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<VpScoringCriterion>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const queryBuilder = this.vpScoringCriterionRepository
        .createQueryBuilder('VpScoringCriterion')
        .where('VpScoringCriterion.tenantId = :tenantId', { tenantId });

      const paginatedData =
        await this.paginationService.paginate<VpScoringCriterion>(
          queryBuilder,
          options,
        );

      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneVpScoringCriterion(id: string): Promise<VpScoringCriterion> {
    try {
      const vpScoringCriterion =
        await this.vpScoringCriterionRepository.findOne({
          where: { id: id },
        });
      return vpScoringCriterion;
    } catch (error) {
      throw new NotFoundException(`VpScoringCriterion Not Found`);
    }
  }

  async updateVpScoringCriterion(
    id: string,
    updateVpScoringCriterionDto: UpdateVpScoringCriterionDto,
    tenantId: string,
  ): Promise<VpScoringCriterion> {
    try {
      const vpScoringCriterion = await this.findOneVpScoringCriterion(id);
      if (!vpScoringCriterion) {
        throw new NotFoundException(`VpScoringCriterion Not Found`);
      }
      await this.vpScoringCriterionRepository.update(
        { id },
        updateVpScoringCriterionDto,
      );
      return await this.findOneVpScoringCriterion(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async removeVpScoringCriterion(id: string): Promise<VpScoringCriterion> {
    try {
      const vpScoringCriterion = await this.findOneVpScoringCriterion(id);
      if (!vpScoringCriterion) {
        throw new NotFoundException(`VpScoringCriterion Not Found`);
      }
      await this.vpScoringCriterionRepository.softRemove({ id });
      return vpScoringCriterion;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
