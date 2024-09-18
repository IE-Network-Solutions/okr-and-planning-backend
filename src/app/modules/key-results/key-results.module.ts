import { Module } from '@nestjs/common';
import { KeyResultsService } from './key-results.service';
import { KeyResultsController } from './key-results.controller';
import { PaginationModule } from '@root/src/core/pagination/pagination.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyResult } from './entities/key-result.entity';
import { MilestonesModule } from '../milestones/milestones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KeyResult]),
    PaginationModule,
    MilestonesModule,
  ],
  controllers: [KeyResultsController],
  providers: [KeyResultsService],
  exports: [KeyResultsService],
})
export class KeyResultsModule {}
