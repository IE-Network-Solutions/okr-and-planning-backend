import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWeeklyPriorityDto } from './dto/create-weekly-priority-task.dto';
import { UpdateWeeklyPriorityDto } from './dto/update-weekly-priority-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterWeeklyPriorityDto } from './dto/filter-weekly-priority-task.dto';
import { WeeklyPriorityTask } from './entities/weekly-priority-task.entity';
import { Repository } from 'typeorm';
import { PaginationService } from '@root/src/core/pagination/pagination.service';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { PaginationDto } from '@root/src/core/commonDto/pagination-dto';
import { WeeklyPrioritiesWeekService } from './weekly-priorities-week.service';

@Injectable()
export class WeeklyPrioritiesService {
  constructor(
    @InjectRepository(WeeklyPriorityTask)
    private weeklyPriorityTaskRepository: Repository<WeeklyPriorityTask>,
    private readonly weeklyPrioritiesWeekService: WeeklyPrioritiesWeekService,
    private readonly paginationService: PaginationService,
  ) {}
  async create(
    createWeeklyPriorityDto: CreateWeeklyPriorityDto,
    tenantId: string,
  ) {
    try {
      const activeWeek =
        await this.weeklyPrioritiesWeekService.findActiveWeek();

      if (!activeWeek) {
        throw new BadRequestException('No active week found');
      }

      const weeklyPriorityTask = this.weeklyPriorityTaskRepository.create({
        ...createWeeklyPriorityDto,
        weeklyPriorityWeek: activeWeek,
        tenantId,
      });

      return await this.weeklyPriorityTaskRepository.save(weeklyPriorityTask);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create WeeklyPriorityTask: ${error.message}`,
      );
    }
  }

  async findAll(
    tenantId: string,
    paginationOptions?: PaginationDto,
    filterWeeklyPriorityDto?: FilterWeeklyPriorityDto,
  ): Promise<
    Pagination<{
      weeklyPriorityWeekId: string;
      departmentId: string;
      tasks: WeeklyPriorityTask[];
    }>
  > {
    try {
      const options: IPaginationOptions = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      };

      const queryBuilder = this.weeklyPriorityTaskRepository
        .createQueryBuilder('WeeklyPriorityTask')
        .leftJoinAndSelect(
          'WeeklyPriorityTask.weeklyPriorityWeek',
          'weeklyPriorityWeek',
        )
        .where('WeeklyPriorityTask.tenantId = :tenantId', { tenantId })
        .orderBy('WeeklyPriorityTask.createdAt', 'DESC');

      if (filterWeeklyPriorityDto) {
        if (filterWeeklyPriorityDto.departmentId?.length) {
          queryBuilder.andWhere(
            'WeeklyPriorityTask.departmentId IN (:...departmentIds)',
            { departmentIds: filterWeeklyPriorityDto.departmentId },
          );
        }

        if (filterWeeklyPriorityDto.weeklyPriorityWeekId?.length) {
          queryBuilder.andWhere(
            'WeeklyPriorityTask.weeklyPriorityWeekId IN (:...weeklyPriorityWeekIds)',
            {
              weeklyPriorityWeekIds:
                filterWeeklyPriorityDto.weeklyPriorityWeekId,
            },
          );
        }

        if (filterWeeklyPriorityDto.planId?.length) {
          queryBuilder.andWhere('WeeklyPriorityTask.planId IN (:...planIds)', {
            planIds: filterWeeklyPriorityDto.planId,
          });
        }

        if (filterWeeklyPriorityDto.taskId?.length) {
          queryBuilder.andWhere('WeeklyPriorityTask.taskId IN (:...taskIds)', {
            taskIds: filterWeeklyPriorityDto.taskId,
          });
        }
      }

      const paginatedData =
        await this.paginationService.paginate<WeeklyPriorityTask>(
          queryBuilder,
          options,
        );

      // Group by week → then by department
      const groupedData = paginatedData.items.reduce((acc, task) => {
        const weekId = task.weeklyPriorityWeek?.id || 'unscheduled';
        const departmentId = task.departmentId;

        if (!acc[weekId]) acc[weekId] = {};
        if (!acc[weekId][departmentId]) acc[weekId][departmentId] = [];
        acc[weekId][departmentId].push(task);

        return acc;
      }, {} as Record<string, Record<string, WeeklyPriorityTask[]>>);

      // Convert grouped object to an array of grouped entries
      const items = Object.entries(groupedData).flatMap(
        ([weeklyPriorityWeekId, departments]) => {
          return Object.entries(departments).map(([departmentId, tasks]) => ({
            weeklyPriorityWeekId,
            departmentId,
            tasks,
          }));
        },
      );

      return {
        ...paginatedData,
        items: items, // Wrap items in an array to match the expected type
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async update(id: string, updateWeeklyPriorityDto: UpdateWeeklyPriorityDto) {
    const weeklyPriorityTask = await this.weeklyPriorityTaskRepository.findOne({
      where: { id },
    });

    if (!weeklyPriorityTask) {
      throw new BadRequestException(
        `WeeklyPriorityTask with id ${id} not found`,
      );
    }

    Object.assign(weeklyPriorityTask, updateWeeklyPriorityDto);

    return await this.weeklyPriorityTaskRepository.save(weeklyPriorityTask);
  }

  async remove(id: string) {
    const weeklyPriorityTask = await this.weeklyPriorityTaskRepository.findOne({
      where: { id },
    });

    if (!weeklyPriorityTask) {
      throw new BadRequestException(
        `WeeklyPriorityTask with id ${id} not found`,
      );
    }

    await this.weeklyPriorityTaskRepository.softRemove(weeklyPriorityTask);
  }
}
