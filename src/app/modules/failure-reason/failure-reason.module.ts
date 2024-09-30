import { Module } from '@nestjs/common';
import { FailureReasonController } from './failure-reason.controller';
import { FailureReasonService } from './failure-reason.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FailureReason } from './entities/failure-reason.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FailureReason])],
  controllers: [FailureReasonController],
  providers: [FailureReasonService],
  exports: [FailureReasonService],

})
export class FailureReasonModule {}
