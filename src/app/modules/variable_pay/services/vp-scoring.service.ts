import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVpScoringDto } from '../dtos/vp-scoring-dto/create-vp-scoring.dto';
import { UpdateVpScoringDto } from '../dtos/vp-scoring-dto/update-vp-scoring.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VpScoring } from '../entities/vp-scoring.entity';
import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';


@Injectable()
export class VpScoringService {  constructor( 
  @InjectRepository(VpScoring)
  private vpScoringRepository: Repository<VpScoring>,
  private readonly paginationService: PaginationService)
  {}
async createVpScoring(
  createVpScoringDto: CreateVpScoringDto,
  tenantId: string,
): Promise<VpScoring> {

  try {
    const vpScoring = await this.vpScoringRepository.create({
      ...createVpScoringDto,
      tenantId,
    });
   return await this.vpScoringRepository.save(
    vpScoring
    );
  } catch (error) {
   
    throw new BadRequestException(error.message);
  } 
}
async findAllVpScorings(
  tenantId: string,
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
      .leftJoinAndSelect('VpScoring.vpScoringCriterions', 'vpScoringCriterions')

      .leftJoinAndSelect('VpScoring.userVpScoring', 'userVpScoring')

      .where('VpScoring.tenantId = :tenantId', { tenantId })
  
    const paginatedData = await this.paginationService.paginate<VpScoring>(
      queryBuilder,
      options,
    );

    return paginatedData
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

async findOneVpScoring(id: string): Promise<VpScoring> {
  try {
    const vpScoring = await this.vpScoringRepository.findOne({
      where: { id: id },
      relations: ['userVpScoring','vpScoringCriterions','vpScoreInstance'],
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
  try{
  const vpScoring = await this.findOneVpScoring(id);
  if (!vpScoring) {
    throw new NotFoundException(`VpScoring Not Found`);
  }
  await this.vpScoringRepository.update({ id }, updateVpScoringDto);
  return await this.findOneVpScoring(id);
}catch(error){
throw new BadRequestException(error.message)
}
}
async removeVpScoring(id: string): Promise<VpScoring> {
  try{
  const vpScoring = await this.findOneVpScoring(id);
  if (!vpScoring) {
    throw new NotFoundException(`VpScoring Not Found`);
  }
  await this.vpScoringRepository.softRemove({ id });
  return vpScoring;
}
catch(error){
  throw new BadRequestException(error.message)
}
}
}
