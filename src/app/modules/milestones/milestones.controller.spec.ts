import { Test } from '@nestjs/testing';
import { MilestonesController } from './milestones.controller';
import { MilestonesService } from './milestones.service';
import { Milestone } from './entities/milestone.entity';
import {
  createMilestoneData,
  milestoneData,
  paginationResultMilestoneData,
  updateMilestoneData,
} from './test/milestone.data';
import { paginationOptions } from '@root/src/core/commonTestData/commonTest.data';

jest.mock('./milestones.service');

describe('MilestoneController', () => {
  let milestoneController: MilestonesController;
  let milestoneService: MilestonesService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [MilestonesController],
      providers: [MilestonesService],
    }).compile();
    milestoneController =
      moduleRef.get<MilestonesController>(MilestonesController);
    milestoneService = moduleRef.get<MilestonesService>(MilestonesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    describe('when createmilestone is called', () => {
      let request: Request;
      let milestone: Milestone;

      beforeEach(async () => {
        request = {
          tenantId: '57577865-7625-4170-a803-a73567e19216',
        } as any;
        milestone = await milestoneController.createMilestone(
          request,
          createMilestoneData(),
        );
      });

      test('then it should call milestoneServic', () => {
        expect(milestoneService.createMilestone).toHaveBeenCalledWith(
          createMilestoneData(),
          request['tenantId'],
        );
      });

      test('then it should return a milestone', () => {
        expect(milestone).toEqual(milestoneData());
      });
    });
  });

  describe('findAll', () => {
    describe('when findAllmilestone is called', () => {
      let request: Request;
      beforeEach(async () => {
        request = {
          tenantId: '57577865-7625-4170-a803-a73567e19216',
        } as any;
        await milestoneController.findAllMilestones(
          request,
          paginationOptions(),
        );
      });

      test('then it should call milestoneService', () => {
        expect(milestoneService.findAllMilestones).toHaveBeenCalledWith(
          paginationOptions(),
          request['tenantId'],
        );
      });

      test('then is should return a milestone', async () => {
        expect(
          await milestoneController.findAllMilestones(
            request,
            paginationOptions(),
          ),
        ).toEqual(paginationResultMilestoneData());
      });
    });
  });

  describe('findOne', () => {
    describe('when findOnemilestone is called', () => {
      let milestone: Milestone;

      beforeEach(async () => {
        milestone = await milestoneController.findOneMilestone(
          milestoneData().id,
        );
      });

      test('then it should call milestoneervice', () => {
        expect(milestoneService.findOneMilestone).toHaveBeenCalledWith(
          milestoneData().id,
        );
      });

      test('then it should return milestone', () => {
        expect(milestone).toEqual(milestoneData());
      });
    });
  });

  describe('update', () => {
    let request: Request;
    describe('when updatemilestone is called', () => {
      let milestone: Milestone;
      let companyProfileImage: Express.Multer.File;
      beforeEach(async () => {
        request = {
          tenantId: '57577865-7625-4170-a803-a73567e19216',
        } as any;
        milestone = await milestoneController.updateMilestone(
          request['tenantId'],
          milestoneData().id,
          updateMilestoneData(),
        );
      });

      test('then it should call milestoneService', () => {
        expect(milestoneService.updateMilestone).toHaveBeenCalledWith(
          milestoneData().id,
          updateMilestoneData(),
        );
      });

      test('then it should return a milestone', () => {
        expect(milestone).toEqual(milestoneData());
      });
    });
  });

  describe('remove', () => {
    describe('when removemilestone is called', () => {
      let request: Request;
      beforeEach(async () => {
        request = {
          tenantId: '57577865-7625-4170-a803-a73567e19216',
        } as any;
        await milestoneController.removeMilestone(request, milestoneData().id);
      });

      test('then it should call milestoneServic', () => {
        expect(milestoneService.removeMilestone).toHaveBeenCalledWith(
          milestoneData().id,
        );
      });

      test('then it should return a milestone', async () => {
        expect(
          await milestoneController.removeMilestone(
            request['tenantId'],
            milestoneData().id,
          ),
        ).toEqual(milestoneData());
      });
    });
  });
});
