import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WeeklyPrioritiesWeekService } from './weekly-priorities-week.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly weeklyPrioritiesWeekService: WeeklyPrioritiesWeekService,
  ) {}

  // Every day, 1 hour past midnight
  @Cron('59 23 * * 5')
  // @Cron(CronExpression.EVERY_30_SECONDS)
  async handleWeeklyPrioritiesWeekCreation() {
    try {
      this.logger.debug('weeklyPrioritiesWeekService cron start');

      const currentCount =
        ((await this.weeklyPrioritiesWeekService.findWeekWithHighestOrder()).count) ||
        0;
      await this.weeklyPrioritiesWeekService.create({
        title: `Week ${Number(currentCount) + 1}`,
        count: Number(currentCount) + 1,
        startDate: new Date().toISOString(),
        endDate: new Date(
          new Date().setDate(new Date().getDate() + 6),
        ).toISOString(),
        isActive: true,
      });

      this.logger.debug(`weeklyPrioritiesWeekService cron finished.`);
    } catch (error) {
      this.logger.error(
        `weeklyPrioritiesWeekService cron failed: ${error.message}`,
      );
    }
  }
}
