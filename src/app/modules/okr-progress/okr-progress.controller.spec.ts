import { Test, TestingModule } from '@nestjs/testing';
import { OkrProgressController } from './okr-progress.controller';
import { OkrProgressService } from './okr-progress.service';

describe('OkrProgressController', () => {
  let controller: OkrProgressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OkrProgressController],
      providers: [OkrProgressService],
    }).compile();

    controller = module.get<OkrProgressController>(OkrProgressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
