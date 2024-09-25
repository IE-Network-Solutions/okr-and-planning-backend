import { Module } from '@nestjs/common';
import { AverageOkrRuleService } from './average-okr-rule.service';
import { AverageOkrRuleController } from './average-okr-rule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AverageOkrRule } from './entities/average-okr-rule.entity';
import { PaginationModule } from '@root/src/core/pagination/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AverageOkrRule]),
    PaginationModule,
  ],
  controllers: [AverageOkrRuleController],
  providers: [AverageOkrRuleService]
})
export class AverageOkrRuleModule { }
