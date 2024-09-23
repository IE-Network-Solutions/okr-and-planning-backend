import { ConfigService } from '@nestjs/config';
import { Objective } from './entities/objective.entity';
import { HttpService } from '@nestjs/axios';
import { mock, MockProxy } from 'jest-mock-extended';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { Connection, DataSource, QueryRunner, Repository } from 'typeorm';
import { getConnectionToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import {
  createobjectiveData,
  delete0bjectiveData,
  objectiveData,
  paginationResultObjectiveData,
  updateObjectiveData,
  updateObjectiveDataOnUpdate,
} from './test/objective.data';
import { KeyResultsService } from '../key-results/key-results.service';
import { MilestonesService } from '../milestones/milestones.service';
import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';
import { ObjectiveService } from './objective.service';

describe('objectiveService', () => {
  let objectiveService: ObjectiveService;
  let objectiveRepository: MockProxy<Repository<Objective>>;
  let paginationService: MockProxy<PaginationService>;
  let keyResultsService: MockProxy<KeyResultsService>;
  let milestonesService: MockProxy<MilestonesService>;
  let httpService: MockProxy<HttpService>;
  let configService: MockProxy<ConfigService>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;
  const objectiveToken = getRepositoryToken(Objective);
  // const mockConnection = {
  //   transaction: jest.fn(),
  // };
  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        update: jest.fn(),
      },
    } as unknown as jest.Mocked<QueryRunner>;
    const moduleRef = await Test.createTestingModule({
      providers: [
        ObjectiveService,
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },
        {
          provide: HttpService,
          useValue: mock<HttpService>(),
        },
        {
          provide: ConfigService,
          useValue: mock<ConfigService>(),
        },
        {
          provide: KeyResultsService,
          useValue: mock<KeyResultsService>(),
        },
        {
          provide: MilestonesService,
          useValue: mock<MilestonesService>(),
        },
        {
          provide: Connection,
          useValue: mock<Connection>(),
        },

        {
          provide: objectiveToken,
          useValue: mock<Repository<Objective>>(),
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
          },
        },
      ],
    }).compile();

    objectiveService = moduleRef.get<ObjectiveService>(ObjectiveService);
    objectiveRepository = moduleRef.get(objectiveToken);
    paginationService = moduleRef.get(PaginationService);
    keyResultsService = moduleRef.get(KeyResultsService);
    milestonesService = moduleRef.get(KeyResultsService);
    httpService = moduleRef.get(HttpService);
    configService = moduleRef.get(ConfigService);
    dataSource = moduleRef.get(DataSource);
    //queryRunner = moduleRef.get<DataSource>(DataSource).createQueryRunner();
    //connection = moduleRef.get(Connection);
  });

  describe('create', () => {
    describe('when createobjectObjective is called', () => {
      let objective: Objective;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
      beforeEach(() => {
        objectiveRepository.create.mockReturnValue(
          createobjectiveData() as any,
        );
        objectiveRepository.save.mockResolvedValue(objectiveData());
      });
      it('should handle transactional logic', async () => {
        await objectiveService.createObjective(createobjectiveData(), tenantId);

        // expect(queryRunner.connect).toHaveBeenCalled();
        // expect(queryRunner.startTransaction).toHaveBeenCalled();
        // expect(queryRunner.commitTransaction).toHaveBeenCalled();
        // expect(queryRunner.release).toHaveBeenCalled();
      });

      it('should callobjectiveRepository.create', async () => {
        expect(queryRunner.connect).toHaveBeenCalled();
        expect(queryRunner.startTransaction).toHaveBeenCalled();
        await objectiveService.createObjective(createobjectiveData(), tenantId);
        expect(objectiveRepository.create).toHaveBeenCalledWith({
          ...createobjectiveData(),
          tenantId,
        });
      });

      it('should callobjectiveRepository.save', async () => {
        await objectiveService.createObjective(createobjectiveData(), tenantId);
        expect(objectiveRepository.save).toHaveBeenCalledWith(
          createobjectiveData(),
        );
      });

      it('should return the createdObjective', async () => {
        objective = await objectiveService.createObjective(
          createobjectiveData(),
          tenantId,
        );
        expect(objective).toEqual(objectiveData());
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne objectObjective is called', () => {
      let objective: Objective;

      beforeEach(async () => {
        objectiveRepository.findOne.mockResolvedValue(objectiveData());
        objective = await objectiveService.findOneObjective(objectiveData().id);
      });

      it('should call objectiveRepository.findOne', async () => {
        await objectiveService.findOneObjective(objectiveData().id);
        expect(objectiveRepository.findOne).toHaveBeenCalledWith({
          where: { id: objectiveData().id },
          relations: ['keyResults', 'keyResults.milestones'],
        });
      });

      it('should return the objective', () => {
        expect(objective).toEqual(objectiveData());
      });
    });
  });
  describe('findAll', () => {
    describe('when findAllClients is called', () => {
      let tenantId: '57577865-7625-4170-a803-a73567e19216';

      beforeEach(async () => {
        paginationService.paginate.mockResolvedValue(
          paginationResultObjectiveData(),
        );
      });

      it('should call paginationService.paginate with correct parameters', async () => {
        await objectiveService.findAllObjectives(
          objectiveData().userId,
          tenantId,
          paginationOptions(),
        );
        expect(paginationService.paginate).toHaveBeenCalledWith(
          objectiveRepository,
          'objective',
          {
            page: paginationOptions().page,
            limit: paginationOptions().limit,
          },
          paginationOptions().orderBy,
          paginationOptions().orderDirection,
          { tenantId },
        );
      });

      it('should return paginated clients', async () => {
        const clients = await objectiveService.findAllObjectives(
          objectiveData().userId,
          tenantId,
          paginationOptions(),
        );
        expect(clients).toEqual(paginationResultObjectiveData());
      });
    });
  });

  describe('update', () => {
    describe('when updateObjective is called', () => {
      let objective: Objective;

      beforeEach(async () => {
        jest
          .spyOn(objectiveService, 'findOneObjective')
          .mockResolvedValueOnce(objectiveData())
          .mockResolvedValueOnce(updateObjectiveData());

        objectiveRepository.update.mockResolvedValue(delete0bjectiveData());

        objective = await objectiveService.updateObjective(
          objectiveData().id,
          updateObjectiveData(),
          objectiveData().tenantId,
        );
      });

      it('should call objectiveService.findOneObjective to check if objective exists', async () => {
        expect(objectiveService.findOneObjective).toHaveBeenCalledWith(
          objectiveData().id,
        );
      });

      it('should call objectiveRepository.update to update the objective', async () => {
        expect(objectiveRepository.update).toHaveBeenCalledWith(
          { id: objectiveData().id },
          updateObjectiveData(),
        );
      });

      it('should call objectiveService.findOneObjective again to return the updated objective', async () => {
        expect(objectiveService.findOneObjective).toHaveBeenCalledWith(
          objectiveData().id,
        );
      });

      it('should return the updated objective', () => {
        expect(objective).toEqual(updateObjectiveData());
      });
    });
  });

  describe('remove', () => {
    describe('when Objective is called', () => {
      let objective: Objective;
      beforeEach(async () => {
        jest
          .spyOn(objectiveService, 'findOneObjective')
          .mockResolvedValueOnce(objectiveData())
          .mockResolvedValueOnce(updateObjectiveData());

        objectiveRepository.softRemove.mockResolvedValue(objectiveData());
      });

      it('should callobjectiveRepository.softRemove', async () => {
        await objectiveService.removeObjective(objectiveData().id);
        expect(objectiveRepository.softRemove).toHaveBeenCalledWith({
          id: objectiveData().id,
        });
      });
      it('should return void when theObjective is removed', async () => {
        const result = await objectiveService.removeObjective(
          objectiveData().id,
        );
        expect(result).toEqual(objectiveData());
      });
    });
  });
});
