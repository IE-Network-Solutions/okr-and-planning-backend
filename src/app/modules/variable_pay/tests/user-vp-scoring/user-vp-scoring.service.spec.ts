import { Test, TestingModule } from '@nestjs/testing';
import { UserVpScoringService } from './user-vp-scoring.service';

describe('UserVpScoringService', () => {
  let service: UserVpScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserVpScoringService],
    }).compile();

    service = module.get<UserVpScoringService>(UserVpScoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
