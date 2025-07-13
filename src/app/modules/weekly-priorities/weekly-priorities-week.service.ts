import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeeklyPriorityWeek } from './entities/weekly-priority-week.entity';
import { WeeklyPriorityWeekDto } from './dto/weekly-priority-week.dto';

@Injectable()
export class WeeklyPrioritiesWeekService {
  constructor(
    @InjectRepository(WeeklyPriorityWeek)
    private weeklyPriorityWeekRepository: Repository<WeeklyPriorityWeek>,
  ) {}

  async findAll(): Promise<WeeklyPriorityWeek[]> {
    try {
      return await this.weeklyPriorityWeekRepository.find({
        order: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async findWeekWithHighestOrder(): Promise<WeeklyPriorityWeek | null> {
    try {
      return await this.weeklyPriorityWeekRepository.findOne({
        where: {}, // Add specific conditions here, e.g., { someField: someValue }
        order: { count: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException('Unable to retrieve the weekly period with highest order. Please try again later.');
    }
  }
  async findActiveWeek(): Promise<WeeklyPriorityWeek | null> {
    try {
      return await this.weeklyPriorityWeekRepository.findOne({
        where: { isActive: true },
      });
    } catch (error) {
      throw new BadRequestException('Unable to retrieve the active weekly period. Please try again later.');
    }
  }

  async create(
    createWeeklyPriorityDto: WeeklyPriorityWeekDto,
  ): Promise<WeeklyPriorityWeek> {
    try {
      // Deactivate all old weeks
      await this.weeklyPriorityWeekRepository.update(
        { isActive: true },
        { isActive: false },
      );

      createWeeklyPriorityDto.isActive = true;
      const weeklyPriorityWeek = this.weeklyPriorityWeekRepository.create(
        createWeeklyPriorityDto,
      );
      return await this.weeklyPriorityWeekRepository.save(weeklyPriorityWeek);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
