import { Module } from '@nestjs/common';
import { MetricTypesService } from './metric-types.service';
import { MetricTypesController } from './metric-types.controller';
import { PaginationModule } from '@root/src/core/pagination/pagination.module';
import { MetricType } from './entities/metric-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([MetricType]), PaginationModule],
  controllers: [MetricTypesController],
  providers: [MetricTypesService],
})
export class MetricTypesModule {}
