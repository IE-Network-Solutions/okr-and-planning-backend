import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CriteriaTarget } from '../entities/criteria-target.entity';
import { Repository } from 'typeorm';
import { CreateCriteriaTargetDto } from '../dtos/criteria-target-dto/create-criteria-target.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { UpdateCriteriaTargetDto } from '../dtos/criteria-target-dto/update-criteria-target.dto';


@Injectable()
export class CriteriaTargetService {
  constructor( 
    @InjectRepository(CriteriaTarget)
    private criteriaTargetRepository: Repository<CriteriaTarget>,
    private readonly paginationService: PaginationService)
    {}
  async createCriteriaTarget(
    createCriteriaTargetDto: CreateCriteriaTargetDto,
    tenantId: string,
  ): Promise<CriteriaTarget> {

    try {
      const criteriaTarget = await this.criteriaTargetRepository.create({
        ...createCriteriaTargetDto,
        tenantId,
      });
     return await this.criteriaTargetRepository.save(
      criteriaTarget
      );
     
     
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
        .where('CriteriaTarget.tenantId = :tenantId', { tenantId })
    
      const paginatedData = await this.paginationService.paginate<CriteriaTarget>(
        queryBuilder,
        options,
      );

      return paginatedData
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
    try{
    const criteriaTarget = await this.findOneCriteriaTarget(id);
    if (!CriteriaTarget) {
      throw new NotFoundException(`CriteriaTarget Not Found`);
    }
    await this.criteriaTargetRepository.update({ id }, updateCriteriaTargetDto);
    return await this.findOneCriteriaTarget(id);
  }catch(error){
  throw new BadRequestException(error.message)
  }
  }
  async removeCriteriaTarget(id: string): Promise<CriteriaTarget> {
    try{
    const criteriaTarget = await this.findOneCriteriaTarget(id);
    if (!CriteriaTarget) {
      throw new NotFoundException(`CriteriaTarget Not Found`);
    }
    await this.criteriaTargetRepository.softRemove({ id });
    return criteriaTarget;
  }
  catch(error){
    throw new BadRequestException(error.message)
  }
  }
}
