import { Module } from '@nestjs/common';
import { PlanCommentsService } from './plan-comments.service';
import { PlanCommentsController } from './plan-comments.controller';

@Module({
  controllers: [PlanCommentsController],
  providers: [PlanCommentsService],
})
export class PlanCommentsModule {}
