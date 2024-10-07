import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OkrProgressService } from './okr-progress.service';
import { KeyResult } from '../key-results/entities/key-result.entity';
import { NAME } from '../metric-types/enum/metric-type.enum';
import { metricTypeData } from '../metric-types/test/test.data';

@Controller('okr-progress')
@ApiTags('okr-progress')
export class OkrProgressController {
  constructor(private readonly okrProgressService: OkrProgressService) {}

  @Post()
  async createObjective() {
    const metricType = {
      id: 'cbec99d6-41bf-405a-bb39-2458bed0538c',
      createdAt: new Date('2024-09-20T04:51:24.825Z'),
      updatedAt: new Date('2024-09-20T04:51:24.825Z'),
      deletedAt: null,
      createdBy: null,
      updatedBy: null,
      name: NAME.CURRENCY,
      description: 'Currency',
    };
    const data: KeyResult = {
      id: '8f17bb39-cf63-4dcc-b6df-cef921eb0399',
      createdAt: new Date('2024-09-20T04:51:24.825Z'),
      updatedAt: new Date('2024-09-20T04:51:24.825Z'),
      deletedAt: null,
      createdBy: null,
      updatedBy: null,
      objective: null,
      obj: null,
      objectiveId: 'dcf27c0c-82c0-450e-a6f3-ae9da3738da6',
      title: 'Currency Key Result',
      description: '20',
      deadline: new Date('2024-09-20T04:51:24.825Z'),
      metricTypeId: 'cbec99d6-41bf-405a-bb39-2458bed0538c',
      initialValue: 5000,
      targetValue: 10000,
      weight: 20,
      currentValue: 300,
      lastUpdateValue: 0,
      progress: 100,
      tenantId: '179055e7-a27c-4d9d-9538-2b2a115661bd',
      milestones: [],
      metricType: metricTypeData(),
    };

    return await this.okrProgressService.calculateKeyResultProgress(
      data,
      false,
      200,
    );
  }
}
