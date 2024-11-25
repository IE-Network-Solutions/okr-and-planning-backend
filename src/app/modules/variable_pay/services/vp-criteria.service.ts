import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VpCriteria } from '../entities/vp-criteria.entity';
import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { CreateVpCriteriaDto } from '../dtos/vp-criteria-dto/create-vp-criteria.dto';
import { UpdateVpCriteriaDto } from '../dtos/vp-criteria-dto/update-vp-criteria.dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';

@Injectable()
export class VpCriteriaService {
  constructor( 
    @InjectRepository(VpCriteria)
    private vpCriteriaRepository: Repository<VpCriteria>,
    private readonly paginationService: PaginationService)
    {}
  async createVpCriteria(
    createVpCriteriaDto: CreateVpCriteriaDto,
    tenantId: string,
  ): Promise<VpCriteria> {

    try {
      const vpCriteria = await this.vpCriteriaRepository.create(createVpCriteriaDto);
     return await this.vpCriteriaRepository.save(
      vpCriteria
      );
     
     
    } catch (error) {
     
      throw new BadRequestException(error.message);
    } 
  }
  async findAllVpCriteria(
    tenantId: string,
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<VpCriteria>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const queryBuilder = this.vpCriteriaRepository
        .createQueryBuilder('VpCriteria')
        .leftJoinAndSelect('VpCriteria.vpScoringCriterions', 'vpScoringCriterions')
        .leftJoinAndSelect('VpCriteria.criteriaTargets', 'criteriaTargets')    
      const paginatedData = await this.paginationService.paginate<VpCriteria>(
        queryBuilder,
        options,
      );

      return paginatedData
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneVpCriteria(id: string): Promise<VpCriteria> {
    try {
      const vpCriteria = await this.vpCriteriaRepository.findOne({
        where: { id: id },
        relations: ['vpScoringCriterions','criteriaTargets'],
      });
      return vpCriteria;
    } catch (error) {
      throw new NotFoundException(`VpCriteria Not Found`);
    }
  }

  async updateVpCriteria(
    id: string,
    updateVpCriteriaDto: UpdateVpCriteriaDto,
    tenantId: string,
  ): Promise<VpCriteria> {
    try{
    const VpCriteria = await this.findOneVpCriteria(id);
    if (!VpCriteria) {
      throw new NotFoundException(`VpCriteria Not Found`);
    }
    await this.vpCriteriaRepository.update({ id }, updateVpCriteriaDto);
    return await this.findOneVpCriteria(id);
  }catch(error){
  throw new BadRequestException(error.message)
  }
  }
  async removeVpCriteria(id: string): Promise<VpCriteria> {
    try{
    const vpCriteria = await this.findOneVpCriteria(id);
    if (!VpCriteria) {
      throw new NotFoundException(`VpCriteria Not Found`);
    }
    await this.vpCriteriaRepository.softRemove({ id });
    return vpCriteria;
  }
  catch(error){
    throw new BadRequestException(error.message)
  }
  }
}
