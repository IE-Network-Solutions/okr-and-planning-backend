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
  ) {}

  onModuleInit() {
    this.logger.debug('CheckInRuleCronService initialized');
  }

  // Run once per day at 11:59 PM to check all rule compliance for the day
  // @Cron('0 59 23 * * *')
  @Cron('0 2 8 * * *') // Every day at 8:01 AM (current time)
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
      const currentDayOfWeek = this.getDayOfWeekName(currentTime);
      const currentTimeString = currentTime.toTimeString().slice(0, 5); // HH:MM format
      
      this.logger.debug(`Current time: ${currentDayOfWeek} at ${currentTimeString}`);
      
      // Step 3: For each rule, check if current day matches rule requirements
      for (const rule of checkInRules) {
        if (this.shouldProcessRuleOnCurrentDay(rule, currentDayOfWeek)) {
          const ruleTimes = rule.targetDate?.map(target => `${target.start}-${target.end}`).join(', ') || 'no time';
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

      // Check if current day matches any of the rule's target days
      for (const target of rule.targetDate) {
        const targetDay = target.date.toLowerCase();

        // Check if current day matches rule target day
        if (currentDayOfWeek.toLowerCase() === targetDay) {
          this.logger.debug(`Rule ${rule.name} matches current day: ${currentDayOfWeek}`);
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
      // Get users assigned to this planning period
      const planningPeriodUsers = await this.getPlanningPeriodUsers(rule.planningPeriodId, rule.tenantId);
      
      this.logger.debug(`Found ${planningPeriodUsers.length} users assigned to planning period: ${rule.planningPeriodId}`);
      
      // Process each user for compliance
      for (const planningPeriodUser of planningPeriodUsers) {
        await this.evaluateUserCompliance(rule, planningPeriodUser.userId, rule.tenantId);
      }
      
    } catch (error) {
      this.logger.error(`Error processing rule ${rule.name}: ${error.message}`);
    }
  }

  /**
   * Get all users assigned to a specific planning period
   */
  private async getPlanningPeriodUsers(planningPeriodId: string, tenantId: string): Promise<PlanningPeriodUser[]> {
    try {
      this.logger.debug(`Getting users for planning period: ${planningPeriodId}, tenant: ${tenantId}`);
      
      const planningPeriodUsers = await this.planningPeriodUserRepository.find({
        where: { 
          planningPeriodId, 
          tenantId,
          deletedAt: null  // Only get active assignments
        },
        relations: ['planningPeriod'], // Also get the planning period info
      });
      
      return planningPeriodUsers;
      
    } catch (error) {
      this.logger.error(`Error getting planning period users: ${error.message}`);
      return [];
    }
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
      // get the plan for the user for the planning period at the time of the rule

      // compare the plan time with the rule time
      
      // Get user's plan for this planning period
      const userPlan = await this.getUserPlan(userId, tenantId, rule.planningPeriodId);
      
      if (!userPlan) {
        this.logger.debug(`User ${userId} has no plan for planning period ${rule.planningPeriodId}`);
        return;
      }
      
      // Check if plan timing meets THIS specific rule's requirements
      const isCompliant = this.checkPlanTimeCompliance(userPlan, rule);
      
      if (isCompliant) {
        // User is compliant - give appreciation feedback
        // await this.giveAppreciationFeedback(userId, tenantId, rule, 'Plan compliance');
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
      
      // Get user's report for this planning period
      const userReport = await this.getUserReport(userId, tenantId, rule.planningPeriodId);
      
      if (!userReport) {
        this.logger.debug(`User ${userId} has no report for planning period ${rule.planningPeriodId}`);
        return;
      }
      
      // Check if report timing meets THIS specific rule's requirements
      const isCompliant = this.checkReportTimeCompliance(userReport, rule);
      
      if (isCompliant) {
        // User is compliant - give appreciation feedback
        // await this.giveAppreciationFeedback(userId, tenantId, rule, 'Report compliance');
      } else {
        // User is not compliant - give reprimand feedback
        await this.giveReprimandFeedback(userId, tenantId, rule, 'Report non-compliance');
      }
      
    } catch (error) {
      this.logger.error(`Error evaluating report compliance for user ${userId}: ${error.message}`);
    }
  }

  /**
   * Get user's report for a specific planning period
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
      
      // Get current time to find report created at this exact time
      const currentTime = new Date();
      const currentDayOfWeek = this.getDayOfWeekName(currentTime);
      const currentTimeString = currentTime.toTimeString().slice(0, 5); // HH:MM format
      
      this.logger.debug(`Looking for report created at current time: ${currentDayOfWeek} at ${currentTimeString}`);
      
      // Get all reports for the user in this planning period
      // Since reports are linked to plans, we need to find reports through plans
      const userReports = await this.reportRepository
        .createQueryBuilder('report')
        .leftJoin('report.plan', 'plan')
        .where('report.userId = :userId', { userId })
        .andWhere('report.tenantId = :tenantId', { tenantId })
        .andWhere('plan.planningUserId = :planningUserId', { planningUserId: planningPeriodUser.id })
        .andWhere('report.deletedAt IS NULL')
        .orderBy('report.createdAt', 'DESC')
        .getMany();
      
      // Find the report created at the current time (same date and time)
      let userReport = null;
      for (const report of userReports) {
        const reportDate = new Date(report.createdAt);
        const reportTime = reportDate.toTimeString().slice(0, 5);
        
        // Compare actual date (year, month, day) and time
        if (this.isSameDateOnly(reportDate, currentTime) && 
            reportTime === currentTimeString) {
          this.logger.debug(`Found report for user ${userId} created at current time: ${reportDate.toDateString()} at ${reportTime}`);
          userReport = report;
          break;
        }
      }
      
      if (!userReport) {
        this.logger.debug(`No report found for user ${userId} created at current time: ${currentDayOfWeek} at ${currentTimeString}`);
      }
      
      if (userReport) {
        this.logger.debug(`Found report for user ${userId}: created at ${userReport.createdAt}`);
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
   * Get user's plan for a specific planning period
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
      
      // Get current time to find plan created at this exact time
      const currentTime = new Date();
      const currentDayOfWeek = this.getDayOfWeekName(currentTime);
      const currentTimeString = currentTime.toTimeString().slice(0, 5); // HH:MM format
      
      this.logger.debug(`Looking for plan created at current time: ${currentDayOfWeek} at ${currentTimeString}`);
      
      // Get all plans for the user in this planning period
      const userPlans = await this.planRepository.find({
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
      
      // Find the plan created at the current time (same date and time)
      let userPlan = null;
      for (const plan of userPlans) {
        const planDate = new Date(plan.createdAt);
        const planTime = planDate.toTimeString().slice(0, 5);
        
        // Compare actual date (year, month, day) and time
        if (this.isSameDateOnly(planDate, currentTime)) {
          this.logger.debug(`Found plan for user ${userId} created at current time: ${planDate.toDateString()} at ${planTime}`);
          userPlan = plan;
          break;
        }
      }
      
      if (!userPlan) {
        this.logger.debug(`No plan found for user ${userId} created at current time: ${currentDayOfWeek} at ${currentTimeString}`);
      }
      
      if (userPlan) {
        this.logger.debug(`Found plan for user ${userId}: created at ${userPlan.createdAt}`);
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
   * Check if plan timing meets rule requirements
   * A plan must satisfy ALL rules that apply to plans (creates an interval)
   */
  private async checkPlanTimingCompliance(userPlan: Plan, planningPeriodId: string, tenantId: string): Promise<boolean> {
    try {
      this.logger.debug(`Checking timing compliance for plan created at: ${userPlan.createdAt}`);
      
      // Get all rules that apply to plans for this planning period and tenant
      const allPlanRules = await this.getAllPlanRulesForCompliance(planningPeriodId, tenantId);
      
      if (allPlanRules.length === 0) {
        this.logger.debug('No plan rules found for compliance check');
        return true; // No rules means no compliance requirements
      }
      
      // Check if plan satisfies ALL plan rules (creates an interval)
      const isCompliant = this.doesPlanSatisfyAllRules(userPlan, allPlanRules);
      
      if (isCompliant) {
        this.logger.debug(`Plan satisfies all ${allPlanRules.length} plan rules`);
      } else {
        this.logger.debug(`Plan does NOT satisfy all plan rules`);
      }
      
      return isCompliant;
      
    } catch (error) {
      this.logger.error(`Error checking plan timing compliance: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if a single plan satisfies a single rule's time requirements
   * Only checks against the target date that matches the current day when cron runs
   */
  private checkPlanTimeCompliance(userPlan: Plan, rule: CheckInRule): boolean {
    try {
      if (!rule.targetDate || rule.targetDate.length === 0) {
        this.logger.debug(`Rule ${rule.name} has no target date/time`);
        return true; // No time requirements means compliant
      }

      const planDate = new Date(userPlan.createdAt);
      const planDayOfWeek = this.getDayOfWeekName(planDate);
      const planTime = planDate.toTimeString().slice(0, 5); // Get HH:MM format

      this.logger.debug(`Plan created on ${planDayOfWeek} at ${planTime}`);

      // Get current day when cron is running
      const currentTime = new Date();
      const currentDayOfWeek = this.getDayOfWeekName(currentTime);

      // Find the target date that matches the current day
      const currentDayTarget = rule.targetDate.find(target => 
        target.date.toLowerCase() === currentDayOfWeek.toLowerCase()
      );

      if (!currentDayTarget) {
        this.logger.debug(`Rule ${rule.name} has no target for current day: ${currentDayOfWeek}`);
        return true; // No target for current day means compliant
      }

      const targetTime = currentDayTarget.start;
      this.logger.debug(`Checking plan creation time against rule target for current day: ${currentDayOfWeek} at ${targetTime}`);

      // Check if plan creation time is compliant with rule target time
      if (this.checkTimeCompliance(planTime, targetTime, rule.operation)) {
        this.logger.debug(`Plan creation time satisfies rule ${rule.name} on ${currentDayOfWeek}: ${planTime} ${rule.operation} ${targetTime}`);
        return true;
      }

      this.logger.debug(`Plan creation time does not satisfy rule ${rule.name} on ${currentDayOfWeek}: ${planTime} ${rule.operation} ${targetTime}`);
      return false;

    } catch (error) {
      this.logger.error(`Error checking plan time compliance: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if a single report satisfies a single rule's time requirements
   * Only checks against the target date that matches the current day when cron runs
   */
  private checkReportTimeCompliance(userReport: Report, rule: CheckInRule): boolean {
    try {
      if (!rule.targetDate || rule.targetDate.length === 0) {
        this.logger.debug(`Rule ${rule.name} has no target date/time`);
        return true; // No time requirements means compliant
      }

      const reportDate = new Date(userReport.createdAt);
      const reportDayOfWeek = this.getDayOfWeekName(reportDate);
      const reportTime = reportDate.toTimeString().slice(0, 5); // Get HH:MM format

      this.logger.debug(`Report created on ${reportDayOfWeek} at ${reportTime}`);

      // Get current day when cron is running
      const currentTime = new Date();
      const currentDayOfWeek = this.getDayOfWeekName(currentTime);

      // Find the target date that matches the current day
      const currentDayTarget = rule.targetDate.find(target => 
        target.date.toLowerCase() === currentDayOfWeek.toLowerCase()
      );

      if (!currentDayTarget) {
        this.logger.debug(`Rule ${rule.name} has no target for current day: ${currentDayOfWeek}`);
        return true; // No target for current day means compliant
      }

      const targetTime = currentDayTarget.start;
      this.logger.debug(`Checking report creation time against rule target for current day: ${currentDayOfWeek} at ${targetTime}`);

      // Check if report creation time is compliant with rule target time
      if (this.checkTimeCompliance(reportTime, targetTime, rule.operation)) {
        this.logger.debug(`Report creation time satisfies rule ${rule.name} on ${currentDayOfWeek}: ${reportTime} ${rule.operation} ${targetTime}`);
        return true;
      }

      this.logger.debug(`Report creation time does not satisfy rule ${rule.name} on ${currentDayOfWeek}: ${reportTime} ${rule.operation} ${targetTime}`);
      return false;

    } catch (error) {
      this.logger.error(`Error checking report time compliance: ${error.message}`);
      return false;
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
   * Check if plan satisfies all plan rules (creates compliance interval)
   */
  private doesPlanSatisfyAllRules(userPlan: Plan, planRules: CheckInRule[]): boolean {
    try {
      for (const rule of planRules) {
        if (rule.timeBased) {
          if (!this.checkPlanTimeCompliance(userPlan, rule)) {
            this.logger.debug(`Plan does NOT satisfy rule: ${rule.name}`);
            return false;
          }
        }
      }
      
      this.logger.debug(`Plan satisfies all ${planRules.length} plan rules`);
      return true;
      
    } catch (error) {
      this.logger.error(`Error checking if plan satisfies all rules: ${error.message}`);
      return false;
    }
  }



  /**
   * Get day of week as number (0 = Sunday, 1 = Monday, etc.)
   */
  private getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  /**
   * Get day of week as string name (Sunday, Monday, etc.)
   */
  private getDayOfWeekName(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  /**
   * Check if two dates are the same (year, month, day only)
   */
  private isSameDateOnly(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Parse time string (HH:MM) to minutes
   */
  private parseTimeString(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Check if plan time satisfies the rule's operation
   */
  private checkTimeCompliance(planTime: string, ruleTime: string, operation: string): boolean {
    // Convert time strings (HH:MM) to minutes for comparison
    const planMinutes = this.parseTimeString(planTime);
    const ruleMinutes = this.parseTimeString(ruleTime);
    
    switch (operation) {
      case '>':
        return planMinutes > ruleMinutes;
      case '<':
        return planMinutes < ruleMinutes;
      case '=':
        return planMinutes === ruleMinutes;
      default:
        this.logger.warn(`Unknown operation: ${operation}`);
        return false;
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
      
      // Create feedback record using FeedbackService - use exact working Postman payload
      await this.feedbackService.createFeedback({
        issuerId: 'a4adaf3d-3baa-4456-9b5e-c156117497c0',
        recipientId: userId,
        feedbackTypeId: '2f65958e-efac-411a-80db-b0cf30812f78',
        feedbackId: '48af9d4e-47c4-4208-b93a-95a2dc1fdaed', // Use working feedbackId from Postman
        monthId: 'a4d7077a-b14b-4c6d-a23d-f088cedc7d22',
        reason: `User complied with check-in rule: ${rule.name}. ${reason}`,
        action: 'Recognized for exceeding sales targets by 25%', // Use working action from Postman
        points: 15, // Use working points from Postman
        carbonCopy: ['user1@company.com', 'user2@company.com'], // Use working carbonCopy from Postman
        cc: ['manager@company.com', 'hr@company.com'], // Use working cc from Postman
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
      
      // Check if user attended before giving reprimand
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const didAttend = await this.attendanceService.didUserAttend(userId, currentDate, tenantId);
      
      if (!didAttend) {
        this.logger.debug(`User ${userId} did not attend on ${currentDate}, skipping reprimand feedback`);
        return;
      }
      
      this.logger.debug(`User ${userId} attended on ${currentDate}, proceeding with reprimand feedback`);
      
      // Create feedback record using FeedbackService - use exact working Postman payload
      await this.feedbackService.createFeedback({
        issuerId: 'a4adaf3d-3baa-4456-9b5e-c156117497c0',
        recipientId: userId,
        feedbackTypeId: '2f65958e-efac-411a-80db-b0cf30812f78',
        feedbackId: '48af9d4e-47c4-4208-b93a-95a2dc1fdaed', // Use working feedbackId from Postman
        monthId: 'a4d7077a-b14b-4c6d-a23d-f088cedc7d22',
        reason: `User failed to comply with check-in rule: ${rule.name}. ${reason}`,
        action: 'Recognized for exceeding sales targets by 25%', // Use working action from Postman
        points: 15, // Use working points from Postman
        carbonCopy: ['user1@company.com', 'user2@company.com'], // Use working carbonCopy from Postman
        cc: ['manager@company.com', 'hr@company.com'], // Use working cc from Postman
        tenantId: tenantId,
      });
      
      this.logger.debug(`Reprimand feedback logged for user ${userId}`);
      
    } catch (error) {
      this.logger.error(`Error giving reprimand feedback to user ${userId}: ${error.message}`);
    }
  }
} 