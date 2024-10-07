import { Module } from '@nestjs/common';
import { RecognitionTypeModule } from '../recognitionType/recognition-type.module';
import { CarbonCopyLogModule } from '../carbonCopyLlog/carbon-copy-log.module';
import { ReprimandLogModule } from '../reprimandLog/reprimand-log.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashbaord.controller';
import { AppreciationLog } from '../appreciationLog/entities/appreciation-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppreciationModule } from '../appreciationLog/appreciation.module';
import { ReprimandLog } from '../reprimandLog/entities/reprimand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppreciationLog, ReprimandLog]),
    AppreciationModule,
    RecognitionTypeModule,
    CarbonCopyLogModule,
    ReprimandLogModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
