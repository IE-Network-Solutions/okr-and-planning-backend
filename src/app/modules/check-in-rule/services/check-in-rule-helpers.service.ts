import { Injectable, Logger } from '@nestjs/common';
import { CheckInRule } from '../entities/check-in-rule.entity';
import { Plan } from '../../plan/entities/plan.entity';
import { Report } from '../../okr-report/entities/okr-report.entity';

@Injectable()
export class CheckInRuleHelpersService {
  private readonly logger = new Logger(CheckInRuleHelpersService.name);

  /**
   * Check if a single plan satisfies a single rule's time requirements
   * Only checks against the target date that matches the current day when cron runs
   */
  checkPlanTimeCompliance(userPlan: Plan, rule: CheckInRule): boolean {
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

      // Find the target date that matches the current day (endDay field)
      const currentDayTarget = rule.targetDate.find(target => 
        target.endDay && typeof target.endDay === 'string' && 
        target.endDay.toLowerCase() === currentDayOfWeek.toLowerCase()
      );

      if (!currentDayTarget) {
        this.logger.debug(`Rule ${rule.name} has no target for current day: ${currentDayOfWeek}`);
        return true; // No target for current day means compliant
      }

      // Check if plan was created within the time interval: startDay+startTime to endDay+endTime
      if (!currentDayTarget.startDay || !currentDayTarget.startTime || !currentDayTarget.endDay || !currentDayTarget.endTime) {
        this.logger.warn(`Rule ${rule.name} has incomplete target data: startDay=${currentDayTarget.startDay}, startTime=${currentDayTarget.startTime}, endDay=${currentDayTarget.endDay}, endTime=${currentDayTarget.endTime}`);
        return false;
      }

      const isWithinInterval = this.checkCrossDayTimeInterval(
        planDate, 
        currentDayTarget.startDay, 
        currentDayTarget.startTime, 
        currentDayTarget.endDay, 
        currentDayTarget.endTime
      );

      if (isWithinInterval) {
        this.logger.debug(`Plan created within rule ${rule.name} interval: ${planDayOfWeek} ${planTime} between ${currentDayTarget.startDay} ${currentDayTarget.startTime} and ${currentDayTarget.endDay} ${currentDayTarget.endTime}`);
        return true;
      } else {
        this.logger.debug(`Plan created OUTSIDE rule ${rule.name} interval: ${planDayOfWeek} ${planTime} not between ${currentDayTarget.startDay} ${currentDayTarget.startTime} and ${currentDayTarget.endDay} ${currentDayTarget.endTime}`);
        return false;
      }

    } catch (error) {
      this.logger.error(`Error checking plan time compliance: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if a single report satisfies a single rule's time requirements
   * Only checks against the target date that matches the current day when cron runs
   */
  checkReportTimeCompliance(userReport: Report, rule: CheckInRule): boolean {
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

      // Find the target date that matches the current day (endDay field)
      const currentDayTarget = rule.targetDate.find(target => 
        target.endDay && typeof target.endDay === 'string' && 
        target.endDay.toLowerCase() === currentDayOfWeek.toLowerCase()
      );

      if (!currentDayTarget) {
        this.logger.debug(`Rule ${rule.name} has no target for current day: ${currentDayOfWeek}`);
        return true; // No target for current day means compliant
      }

      // Check if report was created within the time interval: startDay+startTime to endDay+endTime
      if (!currentDayTarget.startDay || !currentDayTarget.startTime || !currentDayTarget.endDay || !currentDayTarget.endTime) {
        this.logger.warn(`Rule ${rule.name} has incomplete target data: startDay=${currentDayTarget.startDay}, startTime=${currentDayTarget.startTime}, endDay=${currentDayTarget.endDay}, endTime=${currentDayTarget.endTime}`);
        return false;
      }

      const isWithinInterval = this.checkCrossDayTimeInterval(
        reportDate, 
        currentDayTarget.startDay, 
        currentDayTarget.startTime, 
        currentDayTarget.endDay, 
        currentDayTarget.endTime
      );

      if (isWithinInterval) {
        this.logger.debug(`Report created within rule ${rule.name} interval: ${reportDayOfWeek} ${reportTime} between ${currentDayTarget.startDay} ${currentDayTarget.startTime} and ${currentDayTarget.endDay} ${currentDayTarget.endTime}`);
        return true;
      } else {
        this.logger.debug(`Report created OUTSIDE rule ${rule.name} interval: ${reportDayOfWeek} ${reportTime} not between ${currentDayTarget.startDay} ${currentDayTarget.startTime} and ${currentDayTarget.endDay} ${currentDayTarget.endTime}`);
        return false;
      }

    } catch (error) {
      this.logger.error(`Error checking report time compliance: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if a date was created within a cross-day time interval
   * Can be used for reports, plans, or any other date-based validation
   * Example: Monday 03:00 to Tuesday 03:00
   */
  checkCrossDayTimeInterval(
    targetDate: Date, 
    startDay: string, 
    startTime: string, 
    endDay: string, 
    endTime: string
  ): boolean {
    try {
      const targetDayOfWeek = this.getDayOfWeekName(targetDate);
      const targetTime = targetDate.toTimeString().slice(0, 5); // Get HH:MM format

      // Convert start and end times to minutes for easier comparison
      const targetTimeMinutes = this.timeToMinutes(targetTime);
      const startTimeMinutes = this.timeToMinutes(startTime);
      const endTimeMinutes = this.timeToMinutes(endTime);

      // Get day numbers (0 = Sunday, 1 = Monday, etc.)
      const targetDayNumber = this.getDayNumber(targetDayOfWeek);
      const startDayNumber = this.getDayNumber(startDay);
      const endDayNumber = this.getDayNumber(endDay);

      this.logger.debug(`Checking target: ${targetDayOfWeek} ${targetTime} against interval: ${startDay} ${startTime} to ${endDay} ${endTime}`);

      // Case 1: Same day interval (e.g., Monday 09:00 to Monday 17:00)
      if (startDayNumber === endDayNumber) {
        if (targetDayNumber === startDayNumber) {
          const isWithinSameDay = targetTimeMinutes >= startTimeMinutes && targetTimeMinutes <= endTimeMinutes;
          this.logger.debug(`Same day check: ${targetTimeMinutes} >= ${startTimeMinutes} && ${targetTimeMinutes} <= ${endTimeMinutes} = ${isWithinSameDay}`);
          return isWithinSameDay;
        }
        this.logger.debug(`Same day interval but target not on ${startDay}`);
        return false;
      }

      // Case 2: Cross-day interval (e.g., Friday 17:00 to Monday 09:00)
      // Get current day (when cron runs) as reference point
      const currentTime = new Date();
      
      // For endDateTime: use current day + endTime (since we're running on end day)
      const endDateTime = new Date(currentTime);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Convert start day with time to actual Date object using current day as reference
      const startDateTime = this.createDateTimeFromDayAndTime(startDay, startTime, currentTime);
      
      this.logger.debug(`Comparing target date ${targetDate.toISOString()} between ${startDateTime.toISOString()} and ${endDateTime.toISOString()}`);
      
      // Check if target was created between start and end datetime
      const isWithinInterval = targetDate >= startDateTime && targetDate <= endDateTime;
      this.logger.debug(`Target within interval: ${isWithinInterval}`);
      
      return isWithinInterval;

    } catch (error) {
      this.logger.error(`Error checking cross-day time interval: ${error.message}`);
      return false;
    }
  }

  /**
   * Convert time string (HH:MM) to minutes since midnight
   */
  timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get day number (0 = Sunday, 1 = Monday, etc.)
   */
  getDayNumber(dayName: string): number {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days.indexOf(dayName.toLowerCase());
  }

  /**
   * Create a Date object from day name and time, relative to the current day (when cron runs)
   */
  createDateTimeFromDayAndTime(dayName: string, time: string, currentTime: Date): Date {
    const dayNumber = this.getDayNumber(dayName);
    const [hours, minutes] = time.split(':').map(Number);
    // Get the date of the specified day in the same week as the current day
    const currentDayNumber = currentTime.getDay();
    let daysDifference = dayNumber - currentDayNumber;
     // For example: current=Monday(1), target=Friday(5) → go back to last Friday
     if (daysDifference > 0) {
      daysDifference -= 7;
    }
    // Create the target date
    const startDate = new Date(currentTime);
    startDate.setDate(currentTime.getDate() + daysDifference);
    startDate.setHours(hours, minutes, 0, 0);
    return startDate;
  }

  /**
   * Check if a day is between start and end days (handles week wrap-around)
   */
  isDayBetween(day: number, startDay: number, endDay: number): boolean {
    if (startDay <= endDay) {
      // Normal case: startDay < day < endDay
      return day > startDay && day < endDay;
    } else {
      // Week wrap-around case: day is after startDay OR before endDay
      return day > startDay || day < endDay;
    }
  }

  /**
   * Get day of week as number (0 = Sunday, 1 = Monday, etc.)
   */
  getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  /**
   * Get day of week as string name (Sunday, Monday, etc.)
   */
  getDayOfWeekName(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  /**
   * Check if two dates are the same (year, month, day only)
   */
  isSameDateOnly(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Parse time string (HH:MM) to minutes
   */
  parseTimeString(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Check if plan time satisfies the rule's operation
   */
  checkTimeCompliance(planTime: string, ruleTime: string, operation: string): boolean {
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
   * Check if a time falls within a start/end interval (for time-based rules)
   */
  checkTimeIntervalCompliance(planTime: string, startTime: string, endTime: string): boolean {
    // Convert time strings (HH:MM) to minutes for comparison
    const planMinutes = this.parseTimeString(planTime);
    const startMinutes = this.parseTimeString(startTime);
    const endMinutes = this.parseTimeString(endTime);
    
    // Check if plan time is within the interval (inclusive)
    return planMinutes >= startMinutes && planMinutes <= endMinutes;
  }
}