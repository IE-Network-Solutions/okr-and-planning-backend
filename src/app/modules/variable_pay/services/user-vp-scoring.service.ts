import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserVpScoring } from '../entities/user-vp-scoring.entity';
import { QueryRunner, Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { CreateUserVpScoringDto } from '../dtos/user-vp-scoring-dto/create-user-vp-scoring.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UpdateUserVpScoringDto } from '../dtos/user-vp-scoring-dto/update-user-vp-scoring.dto';
import { VpScoreInstanceService } from './vp-score-instance.service';
import { CreateVpScoreInstanceDto } from '../dtos/vp-score-instance-dto/create-vp-score-instance.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { GetFromOrganizatiAndEmployeInfoService } from '../../objective/services/get-data-from-org.service';
import { RequestTemplateDto } from '../dtos/criteria-target-dto/vpCriteriaRequesTemplate.dto';

@Injectable()
export class UserVpScoringService {
  private readonly orgUrl: string;

  constructor( 
    @InjectRepository(UserVpScoring)
    private userVpScoringRepository: Repository<UserVpScoring>,
    private readonly paginationService: PaginationService,
    private readonly vpScoreInstanceService: VpScoreInstanceService,
    private readonly httpService:HttpService,
    private readonly configService: ConfigService,
    private readonly getUsersService:GetFromOrganizatiAndEmployeInfoService

  
  )
    {
      this.orgUrl = this.configService.get<string>('ORG_SERVER');

    }
  async createUserVpScoring(
    createUserVpScoringDto: CreateUserVpScoringDto,
    tenantId: string,
    queryRunner?: QueryRunner,
  ): Promise<UserVpScoring> {
    try {
      const createdUserVpScoring = queryRunner
      ? queryRunner.manager.create(UserVpScoring, {
          ...createUserVpScoringDto,
          tenantId,
        })
      : this.userVpScoringRepository.create({
          ...createUserVpScoringDto,
          tenantId,
        });
    const savedUserVpScoring = queryRunner
      ? await queryRunner.manager.save(UserVpScoring, createdUserVpScoring)
      : await this.userVpScoringRepository.save(createdUserVpScoring);

    return   savedUserVpScoring    
     
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

  async findOneUserVpScoringByUserId(userId: string,tenantId:string): Promise<UserVpScoring> {
    try {
      const userVpScoring = await this.userVpScoringRepository.findOne({
        where: { userId: userId,tenantId:tenantId },
        relations: ['vpScoring','vpScoring.vpScoringCriterions','vpScoring.vpScoringCriterions.vpCriteria','vpScoring.vpScoringCriterions.vpCriteria.criteriaTargets'],
      });
      return userVpScoring;
    } catch (error) {
      throw new NotFoundException(`UserVpScoring Not Found`);
    }
  }

  
  async calculateVP(userId:string,tenantId:string){
    let result =0
    let breakDownData=[]  ///create dto fro break downdata


    let breakDownObject={}
    const userScoring = await this.findOneUserVpScoringByUserId(userId,tenantId)
if(userScoring){

 const totalPercentage= userScoring.vpScoring.totalPercentage
const vpScoringCriterions= userScoring.vpScoring.vpScoringCriterions
const currentMonth = await this.getActiveMonth(tenantId)
const user= await this.getUsersService.getUsers(userId,tenantId)

  const userDepartmentId=user.employeeJobInformation[0].departmentId


 for(const criteria of vpScoringCriterions) {
 let achievedScore= await this.getResults(tenantId,criteria.vpCriteria.sourceEndpoint,userId)
 for(const target of criteria.vpCriteria.criteriaTargets){
  if(target.month){
  
    if(target.month === currentMonth.name || target.departmentId===userDepartmentId){
   
if(criteria.vpCriteria.isDeduction){
  
      result = result-(criteria.weight*achievedScore)/target.target
}

else{
  console.log(result,"elseeee")
  result = result+((criteria.weight)*achievedScore)/target.target

}


    }
  }
  breakDownObject["targetId"]=target.id
 }
 breakDownObject["criteriaId"]=criteria.id

breakDownObject["weight"]=criteria.weight
 breakDownData.push(breakDownObject)

 }
const instance= new CreateVpScoreInstanceDto()
instance.monthId=currentMonth.id
instance.userId=userId
instance.vpScore=result
instance.vpScoringId=userScoring.vpScoring.id
instance.breakdown=breakDownData

 const savedInstance =await this.vpScoreInstanceService.createVpScoreInstance(instance,tenantId)
return savedInstance
  }

}



async getResults(tenantId: string, url: string, userId: string) {
  try {

    const response = await this.httpService
      .post(
        url, 
    null,      
        {
          headers: {
            tenantid: tenantId,
            userId: userId,
          },
        }
      )
      .toPromise();

    return response.data;
  } catch (error) {
    
    throw new Error("An error occurred while fetching the results.");
  }
}


async getActiveMonth(tenantId: string) {
  const response = await this.httpService
  .get(`${this.orgUrl}/month/active/month`, {
      headers: {
        tenantid: tenantId,
      },
    })
    .toPromise();
  return response.data;
}



async getActiveUserVpScoring(tenantId: string) {
  const response = await this.httpService
  .get(`${this.orgUrl}/UserVpScoring/active/UserVpScoring`, {
      headers: {
        tenantid: tenantId,
      },
    })
    .toPromise();
  return response.data;
}


async getUser(tenantId: string) {
  const response = await this.httpService
  .get(`${this.orgUrl}/UserVpScoring/active/UserVpScoring`, {
      headers: {
        tenantid: tenantId,
      },
    })
    .toPromise();
  return response.data;
}
}
