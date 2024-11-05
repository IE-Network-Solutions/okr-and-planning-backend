import { Module } from '@nestjs/common';
import { PlanCommentsService } from './plan-comments.service';
import { PlanCommentsController } from './plan-comments.controller';
import { PlanComment } from './entities/plan-comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanModule } from '../plan/plan.module';
import { Plan } from '../plan/entities/plan.entity';
import { PlanService } from '../plan/plan.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlanComment,Plan]),
    PlanModule
   ],
  controllers: [PlanCommentsController],
  providers: [PlanCommentsService],
})
export class PlanCommentsModule {}
