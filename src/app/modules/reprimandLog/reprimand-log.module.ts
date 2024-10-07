import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReprimandLogService } from './setrvices/reprimand-log.service';
import { ReprimandLogController } from './reprimand-log.controller';
import { ReprimandLog } from './entities/reprimand.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { RecognitionTypeModule } from '../recognitionType/recognition-type.module';
import { CarbonCopyLogModule } from '../carbonCopyLlog/carbon-copy-log.module';
import { AppreciationLog } from '../appreciationLog/entities/appreciation-log.entity';
import { AppreciationCountService } from './setrvices/appreciation-count.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReprimandLog, AppreciationLog]),
    RecognitionTypeModule,
    CarbonCopyLogModule,
  ],
  controllers: [ReprimandLogController],
  providers: [ReprimandLogService, PaginationService, AppreciationCountService],
  exports: [ReprimandLogService],
})
export class ReprimandLogModule {}
