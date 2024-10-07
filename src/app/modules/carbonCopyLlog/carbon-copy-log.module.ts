import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarbonCopyLogService } from './carbon-copy-log.service';
import { CarbonCopyLogController } from './carbon-copy-log.controller';
import { CarbonCopyLog } from './entities/carbon-copy-log.entity';
import { PaginationService } from '@root/src/core/pagination/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([CarbonCopyLog])],
  controllers: [CarbonCopyLogController],
  providers: [CarbonCopyLogService, PaginationService],
  exports: [CarbonCopyLogService],
})
export class CarbonCopyLogModule {}
