import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppreciationService } from './appreciation-log.service';
import { AppreciationController } from './appreciation-log.controller';
import { AppreciationLog } from './entities/appreciation-log.entity';
import { RecognitionTypeModule } from '../recognitionType/recognition-type.module';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { CarbonCopyLogModule } from '../carbonCopyLlog/carbon-copy-log.module';
import { ReprimandLogModule } from '../reprimandLog/reprimand-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppreciationLog]),
    RecognitionTypeModule,
    CarbonCopyLogModule,
    ReprimandLogModule,
  ],
  controllers: [AppreciationController],
  providers: [AppreciationService, PaginationService],
  exports: [AppreciationService],
})
export class AppreciationModule {}
