import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserVpScoring } from '../entities/user-vp-scoring.entity';
import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { CreateUserVpScoringDto } from '../dtos/user-vp-scoring-dto/create-user-vp-scoring.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UpdateUserVpScoringDto } from '../dtos/user-vp-scoring-dto/update-user-vp-scoring.dto';

@Injectable()
export class UserVpScoringService {
  constructor( 
    @InjectRepository(UserVpScoring)
    private userVpScoringRepository: Repository<UserVpScoring>,
    private readonly paginationService: PaginationService)
    {}
  async createUserVpScoring(
    createUserVpScoringDto: CreateUserVpScoringDto,
    tenantId: string,
  ): Promise<UserVpScoring> {

    try {
      const userVpScoring = await this.userVpScoringRepository.create({
        ...createUserVpScoringDto,
        tenantId,
      });
     return await this.userVpScoringRepository.save(
      userVpScoring
      );
     
     
    } catch (error) {
     
      throw new BadRequestException(error.message);
    } 
  }
  async findAllUserVpScorings(
    tenantId: string,
    paginationOptions?: PaginationDto,
  ): Promise<Pagination<UserVpScoring>> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      const queryBuilder = this.userVpScoringRepository
        .createQueryBuilder('UserVpScoring')
        .leftJoinAndSelect('UserVpScoring.vpScoring', 'vpScoring')
        .where('UserVpScoring.tenantId = :tenantId', { tenantId })
    
      const paginatedData = await this.paginationService.paginate<UserVpScoring>(
        queryBuilder,
        options,
      );

      return paginatedData
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneUserVpScoring(id: string): Promise<UserVpScoring> {
    try {
      const userVpScoring = await this.userVpScoringRepository.findOne({
        where: { id: id },
        relations: ['vpScoring'],
      });
      return userVpScoring;
    } catch (error) {
      throw new NotFoundException(`UserVpScoring Not Found`);
    }
  }

  async updateUserVpScoring(
    id: string,
    updateUserVpScoringDto: UpdateUserVpScoringDto,
    tenantId: string,
  ): Promise<UserVpScoring> {
    try{
    const userVpScoring = await this.findOneUserVpScoring(id);
    if (!userVpScoring) {
      throw new NotFoundException(`UserVpScoring Not Found`);
    }
    await this.userVpScoringRepository.update({ id }, updateUserVpScoringDto);
    return await this.findOneUserVpScoring(id);
  }catch(error){
  throw new BadRequestException(error.message)
  }
  }
  async removeUserVpScoring(id: string): Promise<UserVpScoring> {
    try{
    const userVpScoring = await this.findOneUserVpScoring(id);
    if (!UserVpScoring) {
      throw new NotFoundException(`UserVpScoring Not Found`);
    }
    await this.userVpScoringRepository.softRemove({ id });
    return userVpScoring;
  }
  catch(error){
    throw new BadRequestException(error.message)
  }
  }
}
