import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanningPeriod } from './entities/planningPeriod.entity';
import { Repository } from 'typeorm';
import { CreatePlanningPeriodsDTO } from './dto/create-planningPeriods.dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { PaginationService } from '../../../../core/pagination/pagination.service';

@Injectable()
export class PlanningPeriodsService {
  constructor(
    @InjectRepository(PlanningPeriod)
    private planningPeriodRepository: Repository<PlanningPeriod>,
    private readonly paginationService: PaginationService,
  ) {}
  async createPlanningPeriods(
    createPlanningPeriodsDto: CreatePlanningPeriodsDTO,
    tenantId: string,
  ): Promise<PlanningPeriod> {
    try {
      const period = await this.planningPeriodRepository.create({
        ...createPlanningPeriodsDto,
        tenantId: tenantId,
      });
      return await this.planningPeriodRepository.save(period);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('No planning period exist');
      }
      throw error;
    }
  }
  async findAllPlanningPeriods(
    paginationOptions: PaginationDto,
    tenantId: string,
  ): Promise<Pagination<PlanningPeriod>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const paginatedData =
        await this.paginationService.paginate<PlanningPeriod>(
          this.planningPeriodRepository,
          'p',
          options,
          paginationOptions.orderBy,
          paginationOptions.orderDirection,
          { tenantId },
        );
      if (!paginatedData) {
        throw new NotFoundException('No planning period entries found');
      }
      return paginatedData;
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException('No Planning period found');
      }
    }
  }
  async findOnePlanningPeriod(id: string): Promise<PlanningPeriod> {
    try {
      const planning = await this.planningPeriodRepository.findOneByOrFail({
        id,
      });
      return planning;
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(
          'The requested planning period does not exist',
        );
      }
      throw error;
    }
  }
  async updatePlanningPeriod(
    id: string,
    createPlanningPeriodsDto: CreatePlanningPeriodsDTO,
  ): Promise<PlanningPeriod> {
    try {
      const planning = await this.findOnePlanningPeriod(id);
      if (!planning) {
        throw new NotFoundException(
          `Planning period that you are updating with Id ${id} does not exist`,
        );
      }
      const updatedPlanning = await this.planningPeriodRepository.update(
        id,
        createPlanningPeriodsDto,
      );
      if (!updatedPlanning) {
        throw new NotFoundException(
          'Error while updating the selected planning period',
        );
      }
      return await this.findOnePlanningPeriod(id);
    } catch (error) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException(
          'The update attempt can not find the specified period',
        );
      }
      throw error;
    }
  }
  async removePlanningPeriod(id: string): Promise<PlanningPeriod> {
    try {
      const planning = await this.findOnePlanningPeriod(id);
      if (!planning) {
        throw new NotFoundException(
          'Error while deleting the selected planning period',
        );
      }
      return await this.planningPeriodRepository.softRemove({ id });
      //   return planning;
    } catch (error) {
      throw new NotFoundException(
        `The specified planning period with id ${id} can not be found`,
      );
    }
  }
}
