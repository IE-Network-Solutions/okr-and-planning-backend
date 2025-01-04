import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CriteriaTarget } from '../entities/criteria-target.entity';
import { Repository } from 'typeorm';
import { CreateCriteriaTargetDto } from '../dtos/criteria-target-dto/create-criteria-target.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { UpdateCriteriaTargetDto } from '../dtos/criteria-target-dto/update-criteria-target.dto';
import { CreateCriteriaTargetForMultipleDto } from '../dtos/criteria-target-dto/create-vp-criteria-bulk-dto';
import { UpdateCriteriaTargetForMultipleDto } from '../dtos/criteria-target-dto/update-vp-criteria-bulk-dto';

@Injectable()
export class CriteriaTargetService {
  constructor(
    @InjectRepository(CriteriaTarget)
    private criteriaTargetRepository: Repository<CriteriaTarget>,
    private readonly paginationService: PaginationService,
  ) {}
  async createCriteriaTarget(
    createCriteriaTargetDto: CreateCriteriaTargetForMultipleDto,
    tenantId: string,
  ): Promise<any> {
    try {
      const duplicateTarget = [];

      if (
        createCriteriaTargetDto.target &&
        createCriteriaTargetDto.target.length > 0
      ) {
        const allTargets = await Promise.all(
          createCriteriaTargetDto.target.map(async (target) => {
            const targetExists = await this.criteriaTargetRepository.findOne({
              where: {
                month: target.month,
                vpCriteriaId: createCriteriaTargetDto.vpCriteriaId,
                departmentId: createCriteriaTargetDto.departmentId,
              },
            });
            if (!targetExists) {
              const criteriaTarget = new CreateCriteriaTargetDto();
              criteriaTarget.departmentId =
                createCriteriaTargetDto.departmentId;
              criteriaTarget.month = target.month;
              criteriaTarget.target = target.target;
              criteriaTarget.vpCriteriaId =
                createCriteriaTargetDto.vpCriteriaId;
              criteriaTarget.createdBy = createCriteriaTargetDto.createdBy;

              const createdCriteriaTarget =
                this.criteriaTargetRepository.create({
                  ...criteriaTarget,
                  tenantId,
                });
              return this.criteriaTargetRepository.save(createdCriteriaTarget);
            } else {
              duplicateTarget.push(target.month);
            }
          }),
        );

        return { ...allTargets, duplicateTarget };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async findAllCriteriaTargets(
    tenantId: string,
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<CriteriaTarget>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const queryBuilder = this.criteriaTargetRepository
        .createQueryBuilder('CriteriaTarget')
        .leftJoinAndSelect('CriteriaTarget.vpCriteria', 'vpCriteria')
        .where('CriteriaTarget.tenantId = :tenantId', { tenantId });

      const paginatedData =
        await this.paginationService.paginate<CriteriaTarget>(
          queryBuilder,
          options,
        );

      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneCriteriaTarget(id: string): Promise<CriteriaTarget> {
    try {
      const criteriaTarget = await this.criteriaTargetRepository.findOne({
        where: { id: id },
        relations: ['vpCriteria'],
      });
      return criteriaTarget;
    } catch (error) {
      throw new NotFoundException(`CriteriaTarget Not Found`);
    }
  }

  async updateCriteriaTarget(
    id: string,
    updateCriteriaTargetDto: UpdateCriteriaTargetDto,
    tenantId: string,
  ): Promise<CriteriaTarget> {
    try {
      const criteriaTarget = await this.findOneCriteriaTarget(id);
      if (!criteriaTarget) {
        throw new NotFoundException(`CriteriaTarget Not Found`);
      }
      await this.criteriaTargetRepository.update(
        { id },
        updateCriteriaTargetDto,
      );
      return await this.findOneCriteriaTarget(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async updateCriteriaTargetBulk(
    id: string,
    updateCriteriaTargetDto: UpdateCriteriaTargetForMultipleDto,
    tenantId: string,
  ): Promise<CriteriaTarget> {
    try {
      const criteriaTarget = await this.findOneCriteriaTarget(id);
      if (!criteriaTarget) {
        throw new NotFoundException(`CriteriaTarget Not Found`);
      }
      if (
        updateCriteriaTargetDto.target &&
        updateCriteriaTargetDto.target.length > 0
      ) {
        const allTargets = await Promise.all(
          updateCriteriaTargetDto.target.map(async (target) => {
            const criteriaTarget = new UpdateCriteriaTargetDto();
            criteriaTarget.departmentId = updateCriteriaTargetDto.departmentId;
            criteriaTarget.month = target.month;
            criteriaTarget.target = target.target;
            criteriaTarget.vpCriteriaId = updateCriteriaTargetDto.vpCriteriaId;
            criteriaTarget.createdBy = updateCriteriaTargetDto.createdBy;

            await this.criteriaTargetRepository.update({ id }, criteriaTarget);
          }),
        );

        return await this.findOneCriteriaTarget(id);
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async removeCriteriaTarget(id: string): Promise<CriteriaTarget> {
    try {
      const criteriaTarget = await this.findOneCriteriaTarget(id);
      if (!criteriaTarget) {
        throw new NotFoundException(`CriteriaTarget Not Found`);
      }
      await this.criteriaTargetRepository.softRemove({ id });
      return criteriaTarget;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
