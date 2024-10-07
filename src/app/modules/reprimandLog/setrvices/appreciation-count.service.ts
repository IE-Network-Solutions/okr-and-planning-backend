import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppreciationLog } from '../../appreciationLog/entities/appreciation-log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppreciationCountService {
  constructor(
    @InjectRepository(AppreciationLog)
    private appreciationLogRepository: Repository<AppreciationLog>,
  ) {}

  async totalNumberofAppreciation(recipientId: string): Promise<number> {
    return this.appreciationLogRepository
      .createQueryBuilder('appreciationLog')
      .where('appreciationLog.recipientId = :recipientId', { recipientId })
      .getCount();
  }
}
