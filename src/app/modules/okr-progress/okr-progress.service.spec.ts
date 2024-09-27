import { Test, TestingModule } from '@nestjs/testing';
import { OkrProgressService } from './okr-progress.service';

describe('OkrProgressService', () => {
  let service: OkrProgressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OkrProgressService],
    }).compile();

    service = module.get<OkrProgressService>(OkrProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
