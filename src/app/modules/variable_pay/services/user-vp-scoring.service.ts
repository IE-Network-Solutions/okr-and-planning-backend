import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { RefreshVPDto } from '../dtos/user-vp-scoring-dto/refresh-vp.dto';
import { VpScoreBreakDownDto } from '../dtos/vp-score-instance-dto/vp-score-break-down.dto';

@Injectable()
export class UserVpScoringService {
  private readonly orgUrl: string;

  constructor(
    @InjectRepository(UserVpScoring)
    private userVpScoringRepository: Repository<UserVpScoring>,
    private readonly paginationService: PaginationService,
    private readonly vpScoreInstanceService: VpScoreInstanceService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly getUsersService: GetFromOrganizatiAndEmployeInfoService,
  ) {
    this.orgUrl = this.configService.get<string>(
      'externalUrls.orgStructureUrl',
    );
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

      return savedUserVpScoring;
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
        .where('UserVpScoring.tenantId = :tenantId', { tenantId });

      const paginatedData =
        await this.paginationService.paginate<UserVpScoring>(
          queryBuilder,
          options,
        );

      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneUserVpScoring(
    id: string,
    tenantId: string,
  ): Promise<UserVpScoring> {
    try {
      const userVpScoring = await this.userVpScoringRepository.findOne({
        where: { id: id, tenantId: tenantId },
        relations: ['vpScoring'],
      });
      return userVpScoring;
    } catch (error) {
      throw new NotFoundException(`UserVpScoring Not Found`);
    }
  }

  async findOneUserVpScoringByUSerId(
    userId: string,
    tenantId: string,
  ): Promise<UserVpScoring> {
    try {
      const userVpScoring = await this.userVpScoringRepository.findOne({
        where: { userId: userId, tenantId: tenantId },
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
    try {
      const userVpScoring = await this.findOneUserVpScoring(id, tenantId);
      if (!userVpScoring) {
        throw new NotFoundException(`UserVpScoring Not Found`);
      }
      await this.userVpScoringRepository.update({ id }, updateUserVpScoringDto);
      return await this.findOneUserVpScoring(id, tenantId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async removeUserVpScoring(
    id: string,
    tenantId: string,
  ): Promise<UserVpScoring> {
    try {
      const userVpScoring = await this.findOneUserVpScoring(id, tenantId);
      if (!userVpScoring) {
        throw new NotFoundException(`UserVpScoring Not Found`);
      }
      await this.userVpScoringRepository.softRemove({ id });
      return userVpScoring;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneUserVpScoringByUserId(
    userId: string,
    tenantId: string,
  ): Promise<UserVpScoring> {
    try {
      const userVpScoring = await this.userVpScoringRepository.findOne({
        where: { userId: userId, tenantId: tenantId },
        relations: [
          'vpScoring',
          'vpScoring.vpScoringCriterions',
          'vpScoring.vpScoringCriterions.vpCriteria',
          'vpScoring.vpScoringCriterions.vpCriteria.criteriaTargets',
        ],
      });
      return userVpScoring;
    } catch (error) {
      throw new NotFoundException(`UserVpScoring Not Found`);
    }
  }

  async calculateVP(userId: string, tenantId: string): Promise<any> {
    try {
      let result = 0;
      const breakDownData = [];
      let userScoring
   
     userScoring = await this.findOneUserVpScoringByUserId(
        userId,
        tenantId,
      );
          if (userScoring) {
        const totalPercentage = userScoring.vpScoring.totalPercentage;
        const vpScoringCriterions = userScoring.vpScoring.vpScoringCriterions;
       
        const currentMonth = await this.getUsersService.getActiveMonth(
          tenantId,
        );
        
        const user = await this.getUsersService.getUsers(userId, tenantId);

        const userDepartmentId = user.employeeJobInformation[0].departmentId;

        for (const criteria of vpScoringCriterions) {
          let eachScore = 0;
          const achievedScore = await this.getResults(
            tenantId,
            criteria.vpCriteria.sourceEndpoint,
            userId,
          );
          for (const target of criteria.vpCriteria.criteriaTargets) {
            if (target.departmentId === null) {
              if (target.month === currentMonth.name) {
                if (criteria.vpCriteria.isDeduction) {
                  result =
                    result - (criteria.weight * achievedScore) / target.target;
                } else {
                  result =
                    result + (criteria.weight * achievedScore) / target.target;
                }
                eachScore = (criteria.weight * achievedScore) / target.target;

                const breakDownObject = new VpScoreBreakDownDto();
                breakDownObject.targetId = target.id;
                breakDownObject.criteriaId = criteria.vpCriteria.id;
                breakDownObject.weight = criteria.weight;
                breakDownObject.score = eachScore;
                breakDownData.push(breakDownObject);
              }
            } else {
              if (target.departmentId === userDepartmentId) {
                if (criteria.vpCriteria.isDeduction) {
                  result =
                    result - (criteria.weight * achievedScore) / target.target;
                } else {
                  result =
                    result + (criteria.weight * achievedScore) / target.target;
                }
                eachScore = (criteria.weight * achievedScore) / target.target;

                const breakDownObject = new VpScoreBreakDownDto();
                breakDownObject.targetId = target.id;
                breakDownObject.criteriaId = criteria.vpCriteria.id;
                breakDownObject.weight = criteria.weight;
                breakDownObject.score = eachScore;
                breakDownData.push(breakDownObject);
              }
            }
          }
        }
        const instance = new CreateVpScoreInstanceDto();
        instance.monthId = currentMonth.id;
        instance.userId = userId;
        instance.vpScore = instance.vpScore = Math.max(0, Math.min(result, totalPercentage));
        instance.vpScoringId = userScoring.vpScoring.id;
        instance.breakdown = breakDownData;
        const savedInstance =
          await this.vpScoreInstanceService.vpScoreInstanceCreateOrUpdate(
            instance,
            tenantId,
          );
        return savedInstance;
      }
      else{
        throw new NotFoundException('User Vp Scoring Not Found');

      }
   
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async refreshVP(refreshVPDto: RefreshVPDto, tenantId: string): Promise<any> {
    try {
      const allUsersVPScore = [];
      if (refreshVPDto.users && refreshVPDto.users.length > 0) {
        const allUsersVP = await Promise.all(
          refreshVPDto.users.map(async (item) => {
            const vp = await this.calculateVP(item, tenantId);
            if (vp) {
              allUsersVPScore.push(vp);
            }
          }),
        );
        return allUsersVPScore;
      } else {
        const users = await this.getUsersService.getAllUsersWithTenant(
          tenantId,
        );
        const allUsersVP = await Promise.all(
          users.map(async (item) => {
            const vp = await this.calculateVP(item.id, tenantId);
            if (vp) {
              allUsersVPScore.push(vp);
            }
          }),
        );
        return allUsersVPScore;
      }
    } catch (error) {
      //  throw new BadRequestException(error.message);
    }
  }

  async getResults(tenantId: string, url: string, userId: string) {
    try {
      const response = await this.httpService
        .post(url, null, {
          headers: {
            tenantid: tenantId,
            userId: userId,
          },
        })
        .toPromise();

      return response.data;
    } catch (error) {
      throw new Error('An error occurred while fetching the results.');
    }
  }
}
