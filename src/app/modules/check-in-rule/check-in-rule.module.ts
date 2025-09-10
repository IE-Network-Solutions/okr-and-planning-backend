import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config'; // Add this for ConfigService
import { CheckInRule } from './entities/check-in-rule.entity';
import { CheckInRuleService } from './services/check-in-rule.service';
import { CheckInRuleController } from './controllers/check-in-rule.controller';
import { CheckInRuleCronService } from './services/check-in-rule-cron.service';
import { CheckInRuleHelpersService } from './services/check-in-rule-helpers.service';
import { FeedbackService } from './services/feedback.service';
import { AttendanceService } from './services/attendance.service';
import { Plan } from '../plan/entities/plan.entity';
import { Report } from '../okr-report/entities/okr-report.entity';
import { PlanningPeriodUser } from '../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { AppreciationLog } from '../appreciationLog/entities/appreciation-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CheckInRule,
      Plan,
      Report,
      PlanningPeriodUser,
      AppreciationLog,
    ]),
    ScheduleModule.forRoot(), // Back to module-level configuration since it was working
    HttpModule, // Required for FeedbackService
    ConfigModule, // Required for FeedbackService
  ],
  controllers: [CheckInRuleController],
  providers: [CheckInRuleService, CheckInRuleCronService, CheckInRuleHelpersService, FeedbackService, AttendanceService],
  exports: [CheckInRuleService],
})
export class CheckInRuleModule {} 