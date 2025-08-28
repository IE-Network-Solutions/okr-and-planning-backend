import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInRule } from './entities/check-in-rule.entity';
import { CheckInRuleService } from './services/check-in-rule.service';
import { CheckInRuleController } from './controllers/check-in-rule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CheckInRule])],
  controllers: [CheckInRuleController],
  providers: [CheckInRuleService],
  exports: [CheckInRuleService],
})
export class CheckInRuleModule {} 