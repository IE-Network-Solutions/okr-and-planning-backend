import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckInRuleService } from './check-in-rule.service';
import { CheckInRule } from '../entities/check-in-rule.entity';
import { PlanningPeriodUser } from '../../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { Plan } from '../../plan/entities/plan.entity';
import { Report } from '../../okr-report/entities/okr-report.entity';
import { AppreciationLog } from '../../appreciationLog/entities/appreciation-log.entity';
import { FeedbackService } from './feedback.service';
import { AttendanceService } from './attendance.service';
import { CheckInRuleHelpersService } from './check-in-rule-helpers.service';

@Injectable()
export class CheckInRuleCronService implements OnModuleInit {
  private readonly logger = new Logger(CheckInRuleCronService.name);

  constructor(
    @InjectRepository(PlanningPeriodUser)
    private readonly planningPeriodUserRepository: Repository<PlanningPeriodUser>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(AppreciationLog)
    private readonly appreciationLogRepository: Repository<AppreciationLog>,
    private readonly checkInRuleService: CheckInRuleService,
    private readonly feedbackService: FeedbackService,
    private readonly attendanceService: AttendanceService,
    private readonly checkInRuleHelpers: CheckInRuleHelpersService,
  ) {}

  onModuleInit() {
    this.logger.debug('CheckInRuleCronService initialized');
  }

  // Run once per day at 11:59 PM to check all rule compliance for the day
  // @Cron('0 59 23 * * *')
  @Cron('0 09 10 * * *') // Every day at 8:01 AM (current time)
  async handleCheckInRuleCron() {
    try {
      this.logger.debug('Starting daily check-in rule compliance check...');
  
      // Step 1: Get all active check-in rules
      const checkInRules = await this.getAllActiveCheckInRules();
      
      if (checkInRules.length === 0) {
        this.logger.debug('No active check-in rules found');
        return;
      }
      
      // Step 2: Check if current time matches any rule target times
      const currentTime = new Date();
      const currentDayOfWeek = this.checkInRuleHelpers.getDayOfWeekName(currentTime);
      const currentTimeString = currentTime.toTimeString().slice(0, 5); // HH:MM format
      
      this.logger.debug(`Current time: ${currentDayOfWeek} at ${currentTimeString}`);
      
      // Step 3: For each rule, check if current day matches rule requirements
      for (const rule of checkInRules) {
        if (this.shouldProcessRuleOnCurrentDay(rule, currentDayOfWeek)) {
          const ruleTimes = rule.targetDate?.map(target => `${target.startDay} ${target.startTime}-${target.endDay} ${target.endTime}`).join(', ') || 'no time';
          this.logger.debug(`Processing rule: ${rule.name} for ${currentDayOfWeek} at rule times: ${ruleTimes}`);
          await this.processCheckInRule(rule);
        }
      }
      
      
    } catch (error) {
      this.logger.error(
        `Check-in rule cron failed: ${error.message}`,
        error.stack,
      );
    }
  }
  /**
   * Check if a rule should be processed on the current day
   * This determines if the current day matches any of the rule's target days
   */
  private shouldProcessRuleOnCurrentDay(rule: CheckInRule, currentDayOfWeek: string): boolean {
    try {
      if (!rule.timeBased || !rule.targetDate || rule.targetDate.length === 0) {
        return false; // Only process time-based rules with target dates
      }

      // Check if current day matches any of the rule's end days
      for (const target of rule.targetDate) {
        // Add null check for endDay before calling toLowerCase()
        if (!target.endDay || typeof target.endDay !== 'string') {
          this.logger.debug(`Rule ${rule.name} has invalid endDay: ${target.endDay}`);
          continue; // Skip this target if endDay is invalid
        }

        const endDay = target.endDay.toLowerCase();

        // Check if current day matches the rule's end day
        if (currentDayOfWeek.toLowerCase() === endDay) {
          this.logger.debug(`Rule ${rule.name} matches current day: ${currentDayOfWeek} (end day: ${endDay})`);
          return true;
        }
      }

      return false;
      
    } catch (error) {
      this.logger.error(`Error checking if rule should be processed: ${error.message}`);
      return false;
    }
  }

  /**
   * Step 1: Get all active check-in rules
   * This method fetches all check-in rules that are not deleted
   */
  private async getAllActiveCheckInRules(): Promise<CheckInRule[]> {
    try {
      const rules = await this.checkInRuleService.findAllActiveRules();
      return rules;
      
    } catch (error) {
      this.logger.error(`Error fetching active check-in rules: ${error.message}`);
      return []; // Return empty array if there's an error
    }
  }

  /**
   * Step 2: Process a single check-in rule
   * This method gets users assigned to the rule's planning period
   */
  private async processCheckInRule(rule: CheckInRule): Promise<void> {
    try {
     
      const ruleUsers = this.getRuleUsers(rule);
      
      this.logger.debug(`Found ${ruleUsers.length} users assigned to rule: ${rule.name}`);
      
      // Process each user for compliance
      for (const { userId, tenantId } of ruleUsers) {
        await this.evaluateUserCompliance(rule, userId, tenantId);
      }
      
    } catch (error) {
      this.logger.error(`Error processing rule ${rule.name}: ${error.message}`);
    }
  }

  private getRuleUsers(rule: CheckInRule): { userId: string; tenantId: string }[] {
    if (!rule.userIds || rule.userIds.length === 0) {
      return [];
    }

    return rule.userIds.map(userId => ({
      userId,
      tenantId: rule.tenantId,
    }));
  }



  /**
   * Step 3: Evaluate compliance for a specific user
   * This method checks if the user is compliant with the check-in rule
   */
  private async evaluateUserCompliance(rule: CheckInRule, userId: string, tenantId: string): Promise<void> {
    try {
      this.logger.debug(`Evaluating compliance for user: ${userId} with rule: ${rule.name}`);
      
      // Check what type of rule this is (Plan or Report)
      if (rule.appliesTo === 'Plan') {
        await this.evaluatePlanCompliance(rule, userId, tenantId);
      } else if (rule.appliesTo === 'Report') {
        await this.evaluateReportCompliance(rule, userId, tenantId);
      } else {
        this.logger.warn(`Unknown rule type: ${rule.appliesTo} for rule: ${rule.name}`);
      }
      
    } catch (error) {
      this.logger.error(`Error evaluating compliance for user ${userId}: ${error.message}`);
    }
  }

  /**
   * Evaluate plan compliance for a specific user
   */
  private async evaluatePlanCompliance(rule: CheckInRule, userId: string, tenantId: string): Promise<void> {
    try {
      this.logger.debug(`Evaluating plan compliance for user: ${userId}`);
      
      // First check if user attended today
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const didAttend = await this.attendanceService.didUserAttend(userId, currentDate, tenantId);
      
      if (!didAttend) {
        this.logger.debug(`User ${userId} did not attend on ${currentDate} - no action needed for plan compliance`);
        return;
      }
      
      this.logger.debug(`User ${userId} attended on ${currentDate} - checking plan compliance`);
      
      // Get user's plan for this planning period
      const userPlan = await this.getUserPlan(userId, tenantId, rule.planningPeriodId);
      
      if (!userPlan) {
        this.logger.log(`User ${userId} attended on ${currentDate} but did not plan - giving reprimand`);
        await this.giveReprimandFeedback(userId, tenantId, rule, 'Attended but did not plan');
        return;
      }
      
      // Check if plan timing meets THIS specific rule's requirements
      const isCompliant = this.checkInRuleHelpers.checkPlanTimeCompliance(userPlan, rule);
      
      if (isCompliant) {
        // User is compliant - give appreciation feedback
         await this.giveAppreciationFeedback(userId, tenantId, rule, 'Plan compliance');
      } else {
        // User is not compliant - give reprimand feedback
        await this.giveReprimandFeedback(userId, tenantId, rule, 'Plan non-compliance');
      }
      
    } catch (error) {
      // this.logger.error(`Error evaluating plan compliance for user ${userId}: ${error.message}`);
    }
  }

  /**
   * Evaluate report compliance for a specific user
   */
  private async evaluateReportCompliance(rule: CheckInRule, userId: string, tenantId: string): Promise<void> {
    try {
      this.logger.debug(`Evaluating report compliance for user: ${userId}`);
      
      // First check if user attended today
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const didAttend = await this.attendanceService.didUserAttend(userId, currentDate, tenantId);
      
      if (!didAttend) {
        this.logger.debug(`User ${userId} did not attend on ${currentDate} - no action needed for report compliance`);
        return;
      }
      
      this.logger.debug(`User ${userId} attended on ${currentDate} - checking report compliance`);
      
      // Get user's report for this planning period
      const userReport = await this.getUserReport(userId, tenantId, rule.planningPeriodId);
      
      if (!userReport) {
        this.logger.log(`User ${userId} attended on ${currentDate} but did not report - giving reprimand`);
        await this.giveReprimandFeedback(userId, tenantId, rule, 'Attended but did not report');
        return;
      }
      
      // Check if report timing meets THIS specific rule's requirements
      const isCompliant = this.checkInRuleHelpers.checkReportTimeCompliance(userReport, rule);
      
      if (isCompliant) {
        // User is compliant - give appreciation feedback
         await this.giveAppreciationFeedback(userId, tenantId, rule, 'Report compliance');
      } else {
        // User is not compliant - give reprimand feedback
        await this.giveReprimandFeedback(userId, tenantId, rule, 'Report non-compliance');
      }
      
    } catch (error) {
      this.logger.error(`Error evaluating report compliance for user ${userId}: ${error.message}`);
    }
  }

  /**
   * Get user's latest report for a specific planning period
   */
  private async getUserReport(userId: string, tenantId: string, planningPeriodId: string): Promise<Report | null> {
    try {
      // First get the PlanningPeriodUser to get the planningUserId
      const planningPeriodUser = await this.planningPeriodUserRepository.findOne({
        where: {
          userId,
          tenantId,
          planningPeriodId,
          deletedAt: null,
        },
      });
      
      if (!planningPeriodUser) {
        this.logger.debug(`No planning period user found for user ${userId} in planning period ${planningPeriodId}`);
        return null;
      }
      
      // Get the latest report for the user in this planning period
      // Since reports are linked to plans, we need to find reports through plans
      const userReport = await this.reportRepository
        .createQueryBuilder('report')
        .leftJoin('report.plan', 'plan')
        .where('report.userId = :userId', { userId })
        .andWhere('report.tenantId = :tenantId', { tenantId })
        .andWhere('plan.planningUserId = :planningUserId', { planningUserId: planningPeriodUser.id })
        .andWhere('report.deletedAt IS NULL')
        .orderBy('report.createdAt', 'DESC')
        .getOne();
      
      if (userReport) {
        this.logger.debug(`Found latest report for user ${userId}: created at ${userReport.createdAt}`);
      } else {
        this.logger.debug(`No report found for user ${userId} in planning period ${planningPeriodId}`);
      }
      
      return userReport;
      
    } catch (error) {
      this.logger.error(`Error getting report for user ${userId}: ${error.message}`);
      return null;
    }
  }
  /**
   * Get user's latest plan for a specific planning period
   */
  private async getUserPlan(userId: string, tenantId: string, planningPeriodId: string): Promise<Plan | null> {
    try {
      // First get the PlanningPeriodUser to get the planningUserId
      const planningPeriodUser = await this.planningPeriodUserRepository.findOne({
        where: {
          userId,
          tenantId,
          planningPeriodId,
          deletedAt: null,
        },
      });
      
      if (!planningPeriodUser) {
        this.logger.debug(`No planning period user found for user ${userId} in planning period ${planningPeriodId}`);
        return null;
      }
      
      // Get the latest plan for the user in this planning period
      const userPlan = await this.planRepository.findOne({
        where: {
          userId,
          tenantId,
          planningUserId: planningPeriodUser.id,
          deletedAt: null,
        },
        order: {
          createdAt: 'DESC',
        },
      });
      
      if (userPlan) {
        this.logger.debug(`Found latest plan for user ${userId}: created at ${userPlan.createdAt}`);
      } else {
        this.logger.debug(`No plan found for user ${userId} in planning period ${planningPeriodId}`);
      }
      
      return userPlan;
      
    } catch (error) {
      this.logger.error(`Error getting plan for user ${userId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get all rules that apply to plans for a specific planning period and tenant
   */
  private async getAllPlanRulesForCompliance(planningPeriodId: string, tenantId: string): Promise<CheckInRule[]> {
    try {
      // Get all active check-in rules that apply to plans for this planning period and tenant
      const allRules = await this.checkInRuleService.findAllActiveRules();
      
      // Filter for rules that apply to plans and match the planning period and tenant
      const planRules = allRules.filter(rule => 
        rule.appliesTo === 'Plan' && 
        rule.planningPeriodId === planningPeriodId && 
        rule.tenantId === tenantId
      );
      
      this.logger.debug(`Found ${planRules.length} plan rules for planning period ${planningPeriodId}`);
      return planRules;
      
    } catch (error) {
      this.logger.error(`Error getting plan rules for compliance: ${error.message}`);
      return [];
    }
  }

  /**
   * Give appreciation feedback for compliance
   */
  private async giveAppreciationFeedback(userId: string, tenantId: string, rule: CheckInRule, reason: string): Promise<void> {
    try {
      this.logger.debug(`Giving appreciation feedback to user ${userId} for ${reason}`);
      
      // Check if user attended before giving appreciation
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const didAttend = await this.attendanceService.didUserAttend(userId, currentDate, tenantId);
      
      if (!didAttend) {
        this.logger.debug(`User ${userId} did not attend on ${currentDate}, skipping appreciation feedback`);
        return;
      }
      
      this.logger.debug(`User ${userId} attended on ${currentDate}, proceeding with appreciation feedback`);
      
      // Create feedback record using actual rule values
      await this.feedbackService.createFeedback({
        issuerId: '00000000-0000-0000-0000-000000000000', // System-generated feedback UUID
        recipientId: userId,
        feedbackTypeId: rule.categoryId, // Use rule's feedback type
        feedbackId: rule.feedbackId, // Use rule's feedback ID
        monthId: rule.planningPeriodId, // Use planning period as month context
        reason: `User complied with check-in rule: ${rule.name}. ${reason}`,
        action: `Complied with ${rule.appliesTo} check-in rule: ${rule.name}`,
        points: 0,
        tenantId: tenantId,
      });
      this.logger.debug(`Appreciation feedback logged for user ${userId}`);    
    } catch (error) {
      this.logger.error(`Error giving appreciation feedback to user ${userId}: ${error.message}`);
    }
  }

  /**
   * Give reprimand feedback for non-compliance
   */
  private async giveReprimandFeedback(userId: string, tenantId: string, rule: CheckInRule, reason: string): Promise<void> {
    try {
      this.logger.debug(`Giving reprimand feedback to user ${userId} for ${reason}`);
      
      // Create feedback record using actual rule values
      await this.feedbackService.createFeedback({
        issuerId: '00000000-0000-0000-0000-000000000000', // System-generated feedback UUID
        recipientId: userId,
        feedbackTypeId: rule.categoryId, // Use rule's feedback type
        feedbackId: rule.feedbackId, // Use rule's feedback ID
        monthId: rule.planningPeriodId, // Use planning period as month context
        reason: `User failed to comply with check-in rule: ${rule.name}. ${reason}`,
        action: `Failed to comply with ${rule.appliesTo} check-in rule: ${rule.name}`,
        points: 0,
        tenantId: tenantId,
      });
      this.logger.debug(`Reprimand feedback logged for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error giving reprimand feedback to user ${userId}: ${error.message}`);
    }
  }
} 