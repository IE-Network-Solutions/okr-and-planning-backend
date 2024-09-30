import { mock, MockProxy } from 'jest-mock-extended';
import { MilestonesService } from './milestones.service';
import { Repository } from 'typeorm';
import { Milestone } from './entities/milestone.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import {
  createMilestoneData,
  deleteMilestoneData,
  milestoneData,
  paginationResultMilestoneData,
  updateMilestoneData,
} from './test/milestone.data';
import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';

describe('MilestoneService', () => {
  let milestonesService: MilestonesService;
  let milestoneRepository: MockProxy<Repository<Milestone>>;
  let paginationService: MockProxy<PaginationService>;

  const milestoneToken = getRepositoryToken(Milestone);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        MilestonesService,
        {
          provide: PaginationService,
          useValue: mock<PaginationService>(),
        },

        {
          provide: milestoneToken,
          useValue: mock<Repository<Milestone>>(),
        },
      ],
    }).compile();

    milestonesService = moduleRef.get<MilestonesService>(MilestonesService);
    milestoneRepository = moduleRef.get(milestoneToken);
    paginationService = moduleRef.get(PaginationService);
  });

  describe('create', () => {
    describe('when createobjectMilestone is called', () => {
      let milestone: Milestone;
      let tenantId: '57577865-7625-4170-a803-a73567e19216';
      beforeEach(() => {
        milestoneRepository.create.mockReturnValue(
          createMilestoneData() as any,
        );
        milestoneRepository.save.mockResolvedValue(milestoneData());
      });

      it('should callmilestoneRepository.create', async () => {
        await milestonesService.createMilestone(
          createMilestoneData(),
          tenantId,
        );
        expect(milestoneRepository.create).toHaveBeenCalledWith({
          ...createMilestoneData(),
          tenantId,
        });
      });

      it('should callmilestoneRepository.save', async () => {
        await milestonesService.createMilestone(
          createMilestoneData(),
          tenantId,
        );
        expect(milestoneRepository.save).toHaveBeenCalledWith(
          createMilestoneData(),
        );
      });

      it('should return the createdMilestone', async () => {
        milestone = await milestonesService.createMilestone(
          createMilestoneData(),
          tenantId,
        );
        expect(Milestone).toEqual(milestoneData());
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne objectMilestone is called', () => {
      let milestone: Milestone;

      beforeEach(async () => {
        milestoneRepository.findOneByOrFail.mockResolvedValue(milestoneData());
        milestone = await milestonesService.findOneMilestone(
          milestoneData().id,
        );
      });

      it('should call milestoneRepository.findOne', async () => {
        await milestonesService.findOneMilestone(milestoneData().id);
        expect(milestoneRepository.findOneByOrFail).toHaveBeenCalledWith({
          id: milestoneData().id,
        });
      });

      it('should return the Milestone', () => {
        expect(milestone).toEqual(milestoneData());
      });
    });
  });
  describe('findAll', () => {
    describe('when findAllmilestones is called', () => {
      let tenantId: '57577865-7625-4170-a803-a73567e19216';

      beforeEach(async () => {
        paginationService.paginate.mockResolvedValue(
          paginationResultMilestoneData(),
        );
      });

      it('should call paginationService.paginate with correct parameters', async () => {
        await milestonesService.findAllMilestones(
          paginationOptions(),
          tenantId,
        );
        expect(paginationService.paginate).toHaveBeenCalledWith(
          milestoneRepository,
          'Milestone',
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
        const clients = await milestonesService.findAllMilestones(
          paginationOptions(),
          tenantId,
        );
        expect(clients).toEqual(paginationResultMilestoneData());
      });
    });
  });

  describe('update', () => {
    describe('when updateMilestone is called', () => {
      let milestone: Milestone;

      beforeEach(async () => {
        jest
          .spyOn(milestonesService, 'findOneMilestone')
          .mockResolvedValueOnce(milestoneData())
          .mockResolvedValueOnce(updateMilestoneData());

        milestoneRepository.update.mockResolvedValue(deleteMilestoneData());

        milestone = await milestonesService.updateMilestone(
          milestoneData().id,
          updateMilestoneData(),
        );
      });

      it('should call MilestoneService.findOneMilestone to check if Milestone exists', async () => {
        expect(milestonesService.findOneMilestone).toHaveBeenCalledWith(
          milestoneData().id,
        );
      });

      it('should call milestoneRepository.update to update the Milestone', async () => {
        expect(milestoneRepository.update).toHaveBeenCalledWith(
          { id: milestoneData().id },
          updateMilestoneData(),
        );
      });

      it('should call MilestoneService.findOneMilestone again to return the updated Milestone', async () => {
        expect(milestonesService.findOneMilestone).toHaveBeenCalledWith(
          milestoneData().id,
        );
      });

      it('should return the updated Milestone', () => {
        expect(Milestone).toEqual(updateMilestoneData());
      });
    });
  });

  describe('remove', () => {
    describe('when Milestone is called', () => {
      let milestone: Milestone;
      beforeEach(async () => {
        jest
          .spyOn(milestonesService, 'findOneMilestone')
          .mockResolvedValueOnce(milestoneData())
          .mockResolvedValueOnce(updateMilestoneData());

        milestoneRepository.softRemove.mockResolvedValue(milestoneData());
      });

      it('should callmilestoneRepository.softRemove', async () => {
        await milestonesService.removeMilestone(milestoneData().id);
        expect(milestoneRepository.softRemove).toHaveBeenCalledWith({
          id: milestoneData().id,
        });
      });
      it('should return void when theMilestone is removed', async () => {
        const result = await milestonesService.removeMilestone(
          milestoneData().id,
        );
        expect(result).toEqual(milestoneData());
      });
    });
  });
});
