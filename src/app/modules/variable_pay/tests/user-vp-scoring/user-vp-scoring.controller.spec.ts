import { Test, TestingModule } from '@nestjs/testing';
import { UserVpScoringController } from './user-vp-scoring.controller';
import { UserVpScoringService } from './user-vp-scoring.service';

describe('UserVpScoringController', () => {
  let controller: UserVpScoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserVpScoringController],
      providers: [UserVpScoringService],
    }).compile();

    controller = module.get<UserVpScoringController>(UserVpScoringController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
