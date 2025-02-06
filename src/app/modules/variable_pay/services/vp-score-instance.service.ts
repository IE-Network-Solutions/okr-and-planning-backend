import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVpScoreInstanceDto } from '../dtos/vp-score-instance-dto/create-vp-score-instance.dto';
import { UpdateVpScoreInstanceDto } from '../dtos/vp-score-instance-dto/update-vp-score-instance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VpScoreInstance } from '../entities/vp-score-instance.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { In, Repository } from 'typeorm';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { GetFromOrganizatiAndEmployeInfoService } from '../../objective/services/get-data-from-org.service';
import {
  VpScoreDashboardCriteriaDto,
  VpScoreDashboardDto,
  VpScoreTargetDashboardCriteriaDto,
} from '../dtos/vp-score-instance-dto/vp-score-instance-dashboard.do';
import { VpCriteriaService } from './vp-criteria.service';
import { VpScoreTargetFilterDto } from '../dtos/vp-score-instance-dto/vp-filter-dto';
import { CriteriaTargetService } from './criteria-target.service';
import { VpScoreFilterDto } from '../dtos/vp-score-instance-dto/vp-score-filter';
@Injectable()
export class VpScoreInstanceService {
  constructor(
    @InjectRepository(VpScoreInstance)
    private vpScoreInstanceRepository: Repository<VpScoreInstance>,
    private readonly paginationService: PaginationService,
    private readonly getUsersService: GetFromOrganizatiAndEmployeInfoService,
    private readonly vpCriteriaService: VpCriteriaService,
    private readonly criteriaTargetService: CriteriaTargetService,
  ) {}
  async createVpScoreInstance(
    createVpScoreInstanceDto: CreateVpScoreInstanceDto,
    tenantId: string,
  ): Promise<VpScoreInstance> {
    try {
      const vpScoreInstance = await this.vpScoreInstanceRepository.create({
        ...createVpScoreInstanceDto,
        tenantId,
      });
      return await this.vpScoreInstanceRepository.save(vpScoreInstance);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async vpScoreInstanceCreateOrUpdate(
    createVpScoreInstanceDto: CreateVpScoreInstanceDto,
    tenantId: string,
  ): Promise<VpScoreInstance> {
    try {
      const instance = await this.findOneVpScoreInstanceOfUserByMonth(
        createVpScoreInstanceDto.userId,
        tenantId,
        createVpScoreInstanceDto.monthId,
      );
      if (!instance) {
        const vpScoreInstance = await this.vpScoreInstanceRepository.create({
          ...createVpScoreInstanceDto,
          tenantId,
        });
        return await this.vpScoreInstanceRepository.save(vpScoreInstance);
      }

      return await this.updateVpScoreInstance(
        instance.id,
        createVpScoreInstanceDto,
        tenantId,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async findAllVpScoreInstances(
    tenantId: string,
    vpScoreFilterDto: VpScoreFilterDto,
   
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<VpScoreInstance>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      let usersBasicSalary = [];
      try {
        usersBasicSalary = await this.getUsersService.getUsersSalary(tenantId);
      } catch (error) {}
      const queryBuilder = this.vpScoreInstanceRepository
        .createQueryBuilder('VpScoreInstance')
        .leftJoinAndSelect('VpScoreInstance.vpScoring', 'vpScoring')
        .where('VpScoreInstance.tenantId = :tenantId', { tenantId });
      if (vpScoreFilterDto.monthIds && vpScoreFilterDto.monthIds && vpScoreFilterDto.monthIds.length > 0) {
        queryBuilder.andWhere('VpScoreInstance.monthId IN (:...monthId)', {
          monthId: vpScoreFilterDto.monthIds,
        });
      }

      const paginatedData =
        await this.paginationService.paginate<VpScoreInstance>(
          queryBuilder,
          options,
        );
      for (const vpInstance of paginatedData.items) {
        vpInstance['amount'] = 0;
        if (usersBasicSalary && usersBasicSalary.length > 0) {
          const userVpWithAmount = await this.getVPamount(
            vpInstance,
            usersBasicSalary,
          );
          vpInstance['amount'] = userVpWithAmount || 0;
        }
      }

      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneVpScoreInstance(id: string): Promise<VpScoreInstance> {
    try {
      const vpScoreInstance = await this.vpScoreInstanceRepository.findOne({
        where: { id: id },
        relations: ['vpScoring'],
      });
      return vpScoreInstance;
    } catch (error) {
      throw new NotFoundException(`VpScoreInstance Not Found`);
    }
  }
  async findOneVpScoreInstanceOfUserScore(
    userId: string,
    tenantId: string,
  ): Promise<VpScoreInstance[]> {
    try {
      const vpScoreInstance = await this.vpScoreInstanceRepository.find({
        where: { userId: userId },
        relations: ['vpScoring'],
      });
      return vpScoreInstance;
    } catch (error) {
      throw new NotFoundException(`VpScoreInstance Not Found`);
    }
  }

  async updateVpScoreInstance(
    id: string,
    updateVpScoreInstanceDto: UpdateVpScoreInstanceDto,
    tenantId: string,
  ): Promise<VpScoreInstance> {
    try {
      const vpScoreInstance = await this.findOneVpScoreInstance(id);
      if (!vpScoreInstance) {
        throw new NotFoundException(`VpScoreInstance Not Found`);
      }
      await this.vpScoreInstanceRepository.update(
        { id },
        updateVpScoreInstanceDto,
      );
      return await this.findOneVpScoreInstance(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async removeVpScoreInstance(id: string): Promise<VpScoreInstance> {
    try {
      const vpScoreInstance = await this.findOneVpScoreInstance(id);
      if (!vpScoreInstance) {
        throw new NotFoundException(`VpScoreInstance Not Found`);
      }
      await this.vpScoreInstanceRepository.softRemove({ id });
      return vpScoreInstance;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneVpScoreInstanceOfUser(
    userId: string,
    tenantId: string,
  ): Promise<VpScoreDashboardDto> {
    try {
      const userData = new VpScoreDashboardDto();
      const breakdownDataList: VpScoreDashboardCriteriaDto[] = [];
      const activeMonth = await this.getUsersService.getActiveMonth(tenantId);
      const previousActiveMonth =
        await this.getUsersService.activatePreviousActiveMonth(tenantId);

      if (activeMonth) {
        const activeMonthInstance =
          await this.findOneVpScoreInstanceOfUserByMonth(
            userId,
            tenantId,
            activeMonth.id,
          );

        if (activeMonthInstance) {
          userData.maxScore =
            activeMonthInstance.vpScoring?.totalPercentage || 0;
          userData.score = activeMonthInstance.vpScore || 0;
          for (const breakdown of activeMonthInstance.breakdown) {
            const criteria = await this.vpCriteriaService.findOneVpCriteria(
              breakdown.criteriaId,
            );
            const breakDownData = new VpScoreDashboardCriteriaDto();

            breakDownData.name = criteria.name;
            breakDownData.weight = breakdown.weight;
            breakDownData.score = breakdown.score;
            breakDownData.isDeduction = criteria.isDeduction;

            if (previousActiveMonth) {
              const previousActiveMonthInstance =
                await this.findOneVpScoreInstanceOfUserByMonth(
                  userId,
                  tenantId,
                  previousActiveMonth.id,
                );

              if (previousActiveMonthInstance) {
                const prevBreakdown =
                  previousActiveMonthInstance.breakdown.find(
                    (prev) => prev.criteriaId === breakdown.criteriaId,
                  );

                if (prevBreakdown) {
                  breakDownData.previousScore = prevBreakdown.score || 0;
                }
              }

              userData.previousScore =
                previousActiveMonthInstance?.vpScore || 0;
            }
            breakdownDataList.push(breakDownData);
          }
        }
      }

      userData.criteria = breakdownDataList;

      return userData;
    } catch (error) {
      throw new BadRequestException('Failed to fetch VP score instance.');
    }
  }

  async findOneVpScoreInstanceOfUserByMonth(
    userId: string,
    tenantId: string,
    monthId: string,
  ): Promise<VpScoreInstance> {
    try {
      const vpScoreInstance = await this.vpScoreInstanceRepository.findOne({
        where: { userId: userId, monthId: monthId, tenantId: tenantId },
        relations: ['vpScoring'],
      });
      return vpScoreInstance;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneVpScoreInstanceOfUserTarget(
    tenantId: string,
    vpScoreTargetFilterDto: VpScoreTargetFilterDto,
  ): Promise<VpScoreTargetDashboardCriteriaDto[]> {
    try {
      const breakdownDataList: VpScoreTargetDashboardCriteriaDto[] = [];
      const queryBuilder = this.vpScoreInstanceRepository
        .createQueryBuilder('VpScoreInstance')
        .leftJoinAndSelect('VpScoreInstance.vpScoring', 'vpScoring')
        .where('VpScoreInstance.tenantId = :tenantId', { tenantId })
        .andWhere('VpScoreInstance.userId = :userId', {
          userId: vpScoreTargetFilterDto.userId,
        });

      if (vpScoreTargetFilterDto.activeMonthIds?.length) {
        queryBuilder.andWhere('VpScoreInstance.monthId IN (:...monthId)', {
          monthId: vpScoreTargetFilterDto.activeMonthIds,
        });
      }

      const vpScoreInstance = await queryBuilder.getMany();
      const dataList = new VpScoreTargetDashboardCriteriaDto();

      for (const instance of vpScoreInstance) {
        for (const breakdown of instance.breakdown) {
          const criteria = await this.vpCriteriaService.findOneVpCriteria(
            breakdown.criteriaId,
          );
          const target = await this.criteriaTargetService.findOneCriteriaTarget(
            breakdown.targetId,
          );
          dataList.actualScore = breakdown.score;
          dataList.targetValue = target.target;
          dataList.criteriaName = criteria.name;
          breakdownDataList.push({ ...dataList });
        }
      }

      return breakdownDataList;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getVPamount(vpInstance: any, usersBasicSalary: any[]) {
    try {
      const salary = usersBasicSalary.find(
        (item) => item.userId === vpInstance.userId,
      );

      const salaryAmount =
        (salary?.basicSalary * vpInstance?.vpScoring?.totalPercentage) / 100;
      const amount =
        (parseFloat(vpInstance.vpScore.toString()) * salaryAmount) /
        vpInstance?.vpScoring?.totalPercentage;

      return amount;
    } catch (error) {}
  }
}
