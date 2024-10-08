import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecognitionType } from './entities/recognition-type.entity';
import { RecognitionTypeController } from './recognition-type.controller';
import { RecognitionTypeService } from './recognition-type.service';
import { PaginationService } from '@root/src/core/pagination/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecognitionType])],
  controllers: [RecognitionTypeController],
  providers: [RecognitionTypeService, PaginationService],
  exports: [RecognitionTypeService],
})
export class RecognitionTypeModule {}
