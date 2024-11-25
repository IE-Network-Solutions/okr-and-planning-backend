import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVpScoreInstanceDto } from '../dtos/vp-score-instance-dto/create-vp-score-instance.dto';
import { UpdateVpScoreInstanceDto } from '../dtos/vp-score-instance-dto/update-vp-score-instance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VpScoreInstance } from '../entities/vp-score-instance.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { Repository } from 'typeorm';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class VpScoreInstanceService {
  constructor( 
    @InjectRepository(VpScoreInstance)
    private vpScoreInstanceRepository: Repository<VpScoreInstance>,
    private readonly paginationService: PaginationService)
    {}
  async createVpScoreInstance(
    createVpScoreInstanceDto: CreateVpScoreInstanceDto,
    tenantId: string,
  ): Promise<VpScoreInstance> {

    try {
      const vpScoreInstance = await this.vpScoreInstanceRepository.create({
        ...createVpScoreInstanceDto,
        tenantId,
      });
     return await this.vpScoreInstanceRepository.save(
      vpScoreInstance
      );
     
     
    } catch (error) {
     
      throw new BadRequestException(error.message);
    } 
  }
  async findAllVpScoreInstances(
    tenantId: string,
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<VpScoreInstance>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const queryBuilder = this.vpScoreInstanceRepository
        .createQueryBuilder('VpScoreInstance')
        .leftJoinAndSelect('VpScoreInstance.vpScoring', 'vpScoring')
        .where('VpScoreInstance.tenantId = :tenantId', { tenantId })
    
      const paginatedData = await this.paginationService.paginate<VpScoreInstance>(
        queryBuilder,
        options,
      );

      return paginatedData
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

  async updateVpScoreInstance(
    id: string,
    updateVpScoreInstanceDto: UpdateVpScoreInstanceDto,
    tenantId: string,
  ): Promise<VpScoreInstance> {
    try{
    const vpScoreInstance = await this.findOneVpScoreInstance(id);
    if (!vpScoreInstance) {
      throw new NotFoundException(`VpScoreInstance Not Found`);
    }
    await this.vpScoreInstanceRepository.update({ id }, updateVpScoreInstanceDto);
    return await this.findOneVpScoreInstance(id);
  }catch(error){
  throw new BadRequestException(error.message)
  }
  }
  async removeVpScoreInstance(id: string): Promise<VpScoreInstance> {
    try{
    const vpScoreInstance = await this.findOneVpScoreInstance(id);
    if (!vpScoreInstance) {
      throw new NotFoundException(`VpScoreInstance Not Found`);
    }
    await this.vpScoreInstanceRepository.softRemove({ id });
    return vpScoreInstance;
  }
  catch(error){
    throw new BadRequestException(error.message)
  }
  }
}
