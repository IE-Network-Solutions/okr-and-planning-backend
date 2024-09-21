import { Connection, DataSource, QueryBuilder, QueryRunner, Repository } from 'typeorm';
import { Objective } from './entities/objective.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { KeyResultsService } from '../key-results/key-results.service';
import { MilestonesService } from '../milestones/milestones.service';
import { CreateKeyResultDto } from '../key-results/dto/create-key-result.dto';
import { CreateMilestoneDto } from '../milestones/dto/create-milestone.dto';
import { NAME } from '../metric-types/enum/metric-type.enum';
import { Status } from '../milestones/enum/milestone.status.enum';
import { UpdateKeyResultDto } from '../key-results/dto/update-key-result.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ViewUserAndSupervisorOKRDto } from './dto/view-user-and-supervisor-okr';

@Injectable()
export class ObjectiveService {
  private readonly orgUrl: string;
  constructor(
    @InjectRepository(Objective)
    private objectiveRepository: Repository<Objective>,

    private readonly paginationService: PaginationService,
    private readonly keyResultService: KeyResultsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly connection: Connection,

  ) {
    this.orgUrl = this.configService.get<string>('ORG_SERVER');
  }
  async createObjective(
    createObjectiveDto: CreateObjectiveDto,
    tenantId: string,
  ): Promise<Objective> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const objective = await this.objectiveRepository.create({
        ...createObjectiveDto,
        tenantId,
      });
      const savedObjective = await queryRunner.manager.save(Objective, objective);
      if (savedObjective) {
        await this.keyResultService.createBulkkeyResult(
          createObjectiveDto.keyResults,
          tenantId,
          savedObjective.id,
          queryRunner
        );
      }
      await queryRunner.commitTransaction();
      return savedObjective;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllObjectives(
    userId: string,
    tenantId: string,
    paginationOptions: PaginationDto,
  ): Promise<any> {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };
      let queryBuilder = await this.objectiveRepository
        .createQueryBuilder('objective')
        .leftJoinAndSelect('objective.keyResults', 'keyResults')

        .leftJoinAndSelect(
          'keyResults.milestones',
          'milestones',
        )
        .leftJoinAndSelect(
          'keyResults.metricType',
          'metricType',
        )
        .andWhere('objective.tenantId = :tenantId', { tenantId })
        .where('objective.userId = :userId', { userId });

      //queryBuilder.distinctOn(['objective.id'])
      const paginatedData = await this.paginationService.paginate<Objective>(
        queryBuilder,
        options,
      );
      paginatedData.items.forEach((objective) => {
        let totalProgress = 0;
        let completedKeyResults = 0;
        let daysLeft = Math.ceil((new Date(objective.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        objective['daysLeft'] = daysLeft
        objective.keyResults.forEach((keyResult) => {
          let keyResultProgress = 0;
          totalProgress = totalProgress + keyResult.progress
          if (keyResult.progress === 100) {
            completedKeyResults = completedKeyResults + 1
          }
          keyResult.milestones.forEach((milestone) => {
            if (milestone.status === Status.COMPLETED) {
              keyResultProgress = keyResultProgress + 1
            }
          })
          keyResult['keyResultProgress'] = keyResultProgress
        });
        objective['objectiveProgress'] = totalProgress / objective.keyResults.length;
        objective['completedKeyResults'] = completedKeyResults;
      });
      return paginatedData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneObjective(id: string): Promise<Objective> {
    try {
      const Objective = await this.objectiveRepository.findOne({
        where: { id: id },
        relations: ['keyResults', 'keyResults.milestones'],
      });
      return Objective;
    } catch (error) {
      throw new NotFoundException(`Objective Not Found`);
    }
  }

  async updateObjective(
    id: string,
    updateObjectiveDto: UpdateObjectiveDto,
    tenantId: string
  ): Promise<Objective> {
    const Objective = await this.findOneObjective(id);
    if (!Objective) {
      throw new NotFoundException(`Objective Not Found`);
    }
    let keyResults: UpdateKeyResultDto[] = [];
    keyResults = updateObjectiveDto.keyResults
    delete updateObjectiveDto.keyResults
    // const objectiveTobeUpdated = new UpdateObjectiveDto
    // objectiveTobeUpdated.title = updateObjectiveDto.title
    // objectiveTobeUpdated.deadline = updateObjectiveDto.deadline
    // objectiveTobeUpdated.description = updateObjectiveDto.description
    // objectiveTobeUpdated.userId = updateObjectiveDto.userId
    // objectiveTobeUpdated.allignedKeyResultId = updateObjectiveDto.allignedKeyResultId

    await this.objectiveRepository.update(
      { id },
      updateObjectiveDto,
    );
    if (keyResults.length > 0) {
      console.log(keyResults, "keyResults")
      await this.keyResultService.updatekeyResults(
        keyResults,
        tenantId,
        id
      );
    }

    return await this.findOneObjective(id);
  }




  async updateObjectives(
    id: string,
    updateObjectiveDto: UpdateObjectiveDto,
  ): Promise<Objective> {

    const Objective = await this.findOneObjective(id);
    if (!Objective) {
      throw new NotFoundException(`Objective Not Found`);
    }

    await this.objectiveRepository.update(
      { id },

      updateObjectiveDto,
    );

    return await this.findOneObjective(id);
  }

  async removeObjective(id: string): Promise<Objective> {
    const objective = await this.findOneObjective(id);
    if (!objective) {
      throw new NotFoundException(`Objective Not Found`);
    }
    await this.objectiveRepository.softRemove({ id });
    return objective;
  }


  async calculateUserOkr(userId: string, tenantId: string, paginationOptions?: PaginationDto,)
    : Promise<ViewUserAndSupervisorOKRDto> {
    const objectives = await this.findAllObjectives(userId, tenantId, paginationOptions);
    console.log(objectives.items, "jjjj")
    // if (!objectives.items) {
    //   console.log(objectives.items, "bbbbb")

    //   let returnedObject = new ViewUserAndSupervisorOKRDto
    //   returnedObject.daysLeft = 0,
    //     returnedObject.okrCompleted = 0
    //   returnedObject.userOkr = 0
    //   return returnedObject

    // }
    let userOkr = 0
    let completedOkr = 0
    let daysLeft = 0

    for (const objective of objectives.items) {
      userOkr = userOkr + objective['objectiveProgress']
      if (objective['completedKeyResults'] === objective.keyResults.length) {
        completedOkr = completedOkr + 1
      }

    }
    daysLeft = Math.max(...objectives.items.map(item => item['daysLeft']));
    let returnedObject = new ViewUserAndSupervisorOKRDto
    returnedObject.daysLeft = daysLeft,
      returnedObject.okrCompleted = completedOkr
    returnedObject.userOkr = userOkr / objectives.items.length


    return returnedObject

  }
  async calculateUserOkrs(userId: string, tenantId: string, token: string, paginationOptions?: PaginationDto,)

    : Promise<ViewUserAndSupervisorOKRDto> {
    const userOkr = await this.calculateUserOkr(userId, tenantId, paginationOptions)
    const response = await this.httpService
      .get(
        `http://localhost:8008/api/v1/users/${userId}`,
        {
          headers: {
            tenantid: tenantId
          },
        },
      )
      .toPromise();
    const supervisorOkr = await this.calculateUserOkr(response.data.reportingTo.id, tenantId, paginationOptions)
    let returnedObject = new ViewUserAndSupervisorOKRDto
    returnedObject.daysLeft = userOkr.daysLeft,
      returnedObject.okrCompleted = userOkr.okrCompleted
    returnedObject.userOkr = userOkr.userOkr
    returnedObject.supervisorOkr = supervisorOkr.userOkr

    return returnedObject

  }
}


// if (keyResult.metricType.name === NAME.MILESTONE) {
//   // Calculate progress based on completed milestones
//   keyResult.milestones.forEach((milestone) => {
//     if (milestone.status === Status.COMPLETED) {
//       keyResultProgress += milestone.weight;
//     }
//   });
// } else if (keyResult.metricType.name === NAME.ACHIEVE) {
//   // Directly use key result progress for ACHIEVE type
//   keyResultProgress = keyResult.progress;
// } else {
//   // Calculate percentage for other metric types
//   const difference = keyResult.targetValue - keyResult.currentValue;
//   keyResultProgress = ((difference * 100) / keyResult.targetValue);
// }

// // Add the progress for the current key result
// totalProgress += keyResultProgress;

// // Check if key result is completed
// if (keyResultProgress >= 100) {
//   completedKeyResults++;
// }




// for (const data of paginatedData.items) {
//   let progress
//   let completedObjective
//   for (const key of data.keyResults) {
//     let completedkeyResults

//     if (key.metricType.name === NAME.MILESTONE) {
//       for (const milestone of key.milestones) {
//         if (milestone.status === Status.COMPLETED) {
//           progress = progress + milestone.weight
//         }
//         if (key.progress == 100) {

//           completedObjective = completedObjective + 1
//         }

//       }

//     }
//     else if (key.metricType.name === NAME.ACHIEVE) {
//       progress = progress + key.progress
//       if (key.progress == 100) {

//         completedObjective = completedObjective + 1
//       }

//     }
//     else {
//       let gg = key.targetValue - key.currentValue
//       let percent = (gg * 100) / key.targetValue
//       progress = progress + percent
//       if (key.progress == 100) {

//         completedObjective = completedObjective + 1
//       }

//     }

//   }
//   data['objectiveProgress'] = progress / data.keyResults.length

// }


// Process each objective for progress and completion calculations