import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVpScoringDto } from '../dtos/vp-scoring-dto/create-vp-scoring.dto';
import { UpdateVpScoringDto } from '../dtos/vp-scoring-dto/update-vp-scoring.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VpScoring } from '../entities/vp-scoring.entity';
import { Connection, QueryRunner, Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { CreateUserVpScoringDto } from '../dtos/user-vp-scoring-dto/create-user-vp-scoring.dto';
import { UserVpScoringService } from './user-vp-scoring.service';
import { CreateVpScoringCriterionDto } from '../dtos/vp-scoring-criteria-dto/create-vp-scoring-criterion.dto';
import { VpScoringCriteriaService } from './vp-scoring-criteria.service';
import { VpScoringFilterDto } from '../dtos/vp-scoring-dto/filter-vp-scoring-dto';

@Injectable()
export class VpScoringService {
  constructor(
    @InjectRepository(VpScoring)
    private vpScoringRepository: Repository<VpScoring>,
    private readonly paginationService: PaginationService,
    private readonly userVpScoringService: UserVpScoringService,
    private readonly vpScoringCriteriaService: VpScoringCriteriaService,
    private readonly connection: Connection,
  ) {}
  async createVpScoring(
    createVpScoringDto: CreateVpScoringDto,
    tenantId: string,
  ): Promise<VpScoring> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const vpScoring = await this.vpScoringRepository.create({
        ...createVpScoringDto,
        tenantId,
      });
      const savedVpScoring = await await queryRunner.manager.save(
        VpScoring,
        vpScoring,
      );

      if (
        createVpScoringDto.createUserVpScoringDto &&
        createVpScoringDto.createUserVpScoringDto.length > 0
      ) {
        await Promise.all(
          createVpScoringDto.createUserVpScoringDto.map(
            async (createUserVpScoring) => {
              const userVPScoring = new CreateUserVpScoringDto();
              userVPScoring.vpScoringId = savedVpScoring.id;
              userVPScoring.userId = createUserVpScoring.userId;
              userVPScoring.createdBy = createVpScoringDto.createdBy;

              await this.userVpScoringService.createUserVpScoring(
                userVPScoring,
                tenantId,
                queryRunner,
              );
            },
          ),
        );
      }

      if (
        createVpScoringDto.vpScoringCriteria &&
        createVpScoringDto.vpScoringCriteria.length > 0
      ) {
        await Promise.all(
          createVpScoringDto.vpScoringCriteria.map(async (criteria) => {
            const vpCriteria = new CreateVpScoringCriterionDto();
            vpCriteria.vpScoringId = savedVpScoring.id;
            vpCriteria.vpCriteriaId = criteria.vpCriteriaId;
            vpCriteria.weight = criteria.weight;
            vpCriteria.createdBy = createVpScoringDto.createdBy;

            await this.vpScoringCriteriaService.createVpScoringCriterion(
              vpCriteria,
              tenantId,
              queryRunner,
            );
          }),
        );
      }

      await queryRunner.commitTransaction();
      return await this.findOneVpScoring(savedVpScoring.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
  async findAllVpScorings(
    tenantId: string,
    vpScoringFilterDto?:VpScoringFilterDto,
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<VpScoring>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const queryBuilder = this.vpScoringRepository
        .createQueryBuilder('VpScoring')
        .leftJoinAndSelect('VpScoring.vpScoreInstance', 'vpScoreInstance')
        .leftJoinAndSelect(
          'VpScoring.vpScoringCriterions',
          'vpScoringCriterions',
        )
        .leftJoinAndSelect('vpScoringCriterions.vpCriteria', 'vpCriteria')
        .leftJoinAndSelect('VpScoring.userVpScoring', 'userVpScoring')
        .where('VpScoring.tenantId = :tenantId', { tenantId });

if(vpScoringFilterDto && vpScoringFilterDto.monthId ){
  
  queryBuilder.andWhere('VpScoring.monthId = :monthId', { monthId:vpScoringFilterDto.monthId });

}
      const paginatedData = await this.paginationService.paginate<VpScoring>(
        queryBuilder,
        options,
      );

      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneVpScoring(id: string): Promise<VpScoring> {
    try {
      const vpScoring = await this.vpScoringRepository.findOne({
        where: { id: id },
        relations: [
          'userVpScoring',
          'vpScoringCriterions',
          'vpScoreInstance',
          'vpScoringCriterions.vpCriteria',
        ],
      });
      return vpScoring;
    } catch (error) {
      throw new NotFoundException(`VpScoring Not Found`);
    }
  }

  async updateVpScoring(
    id: string,
    updateVpScoringDto: UpdateVpScoringDto,
    tenantId: string,
  ): Promise<VpScoring> {
    try {
      const vpScoring = await this.findOneVpScoring(id);
      if (!vpScoring) {
        throw new NotFoundException(`VpScoring Not Found`);
      }
      const vpScoringCriteria = updateVpScoringDto.vpScoringCriteria;
      const updateVpScoring = updateVpScoringDto.createUserVpScoringDto;
      delete updateVpScoringDto.createUserVpScoringDto;
      delete updateVpScoringDto.vpScoringCriteria;
      if (
        vpScoring?.vpScoringCriterions &&
        vpScoring?.vpScoringCriterions.length > 0
      ) {
        const vpCriteriaToDelete = vpScoring?.vpScoringCriterions?.filter(
          (item) =>
            !vpScoringCriteria.some((vpCriteria) => vpCriteria.id === item.id),
        );

        if (vpCriteriaToDelete.length > 0) {
          for (const deleteCriteria of vpCriteriaToDelete) {
            await this.vpScoringCriteriaService.removeVpScoringCriterion(
              deleteCriteria.id,
            );
          }
        }
      }

      if (vpScoring?.userVpScoring && vpScoring?.userVpScoring.length > 0) {
        const userVpScoringToDelete = vpScoring?.userVpScoring?.filter(
          (item) =>
            !updateVpScoring.some((vpCriteria) => vpCriteria.id === item.id),
        );
        if (userVpScoringToDelete.length > 0) {
          for (const deleteUserScoreCriteria of userVpScoringToDelete) {
            await this.userVpScoringService.removeUserVpScoring(
              deleteUserScoreCriteria.id,
              tenantId,
            );
          }
        }
      }

      await this.vpScoringRepository.update({ id }, updateVpScoringDto);

      if (updateVpScoring.length && updateVpScoring.length > 0) {
        for (const criteria of vpScoringCriteria)
          if (criteria.id) {
            criteria['updatedBy'] = updateVpScoringDto.updatedBy;
            await this.vpScoringCriteriaService.updateVpScoringCriterion(
              criteria.id,
              criteria,
              tenantId,
            );
          } else {
            criteria.vpScoringId = id;
            criteria.createdBy = updateVpScoringDto.updatedBy;
            await this.vpScoringCriteriaService.createVpScoringCriterion(
              criteria,
              tenantId,
            );
          }
      }
      if (updateVpScoring.length && updateVpScoring.length > 0) {
        for (const score of updateVpScoring) {
          if (score.id) {
            score['updatedBy'] = updateVpScoringDto.updatedBy;

            await this.userVpScoringService.updateUserVpScoring(
              score.id,
              score,
              tenantId,
            );
          } else {
            score.vpScoringId = id;
            score.createdBy = updateVpScoringDto.createdBy;

            await this.userVpScoringService.createUserVpScoring(
              score,
              tenantId,
            );
          }
        }
      }
      return await this.findOneVpScoring(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async removeVpScoring(id: string): Promise<VpScoring> {
    try {
      const vpScoring = await this.findOneVpScoring(id);
      if (!vpScoring) {
        throw new NotFoundException(`VpScoring Not Found`);
      }
      await this.vpScoringRepository.softRemove({ id });
      return vpScoring;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
