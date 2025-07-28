import { Injectable } from '@nestjs/common';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  Repository,
  SoftRemoveEvent,
} from 'typeorm';
import { PlanTask } from '../entities/plan-task.entity';
import { ReportTask } from '../../okr-report-task/entities/okr-report-task.entity';
import { OkrReportTaskService } from '../../okr-report-task/okr-report-task.service';
import { Plan } from '../../plan/entities/plan.entity';

@EventSubscriber()
@Injectable()
export class PlanTaskSubscriber implements EntitySubscriberInterface<PlanTask> {
  constructor(private readonly okrReportTaskService: OkrReportTaskService) {}

  listenTo() {
    return PlanTask;
  }

  async afterSoftRemove(event: SoftRemoveEvent<PlanTask>): Promise<void> {
    try {
      const reportTaskRepository: Repository<ReportTask> =
        event.connection.getRepository(ReportTask);

      const reportTasks = await reportTaskRepository.find({
        where: { planTaskId: event.entity.id },
      });

      if (reportTasks.length > 0) {
        await reportTaskRepository.softRemove(reportTasks);
      }
      const parentTask = event.entity;
      if (!parentTask || !parentTask.planId || !parentTask.id) {
        return;
      }

      const planRepository: Repository<Plan> =
        event.connection.getRepository(Plan);
      const planTaskRepository: Repository<PlanTask> =
        event.connection.getRepository(PlanTask);

      const childPlans = await planRepository.find({
        where: { parentPlanId: parentTask.planId },
        relations: ['tasks'],
      });

      for (const childPlan of childPlans) {
        if (!childPlan.tasks || !Array.isArray(childPlan.tasks)) {
          continue;
        }

        const childTasksToDelete = childPlan.tasks.filter(
          (task) => task.parentTaskId && task.parentTaskId === parentTask.id,
        );

        if (childTasksToDelete.length === 0) {
          continue;
        }

        const getTheWeightOfTheChildTasks = childTasksToDelete.reduce(
          (sum, task) => sum + (Number(task.weight) || 0),
          0,
        );
        await planTaskRepository.softRemove(childTasksToDelete);

        const remainingTasks = childPlan.tasks.filter(
          (task) => !task.parentTaskId || task.parentTaskId !== parentTask.id,
        );

        if (remainingTasks.length === 0) {
          continue;
        }
        const weightPerTask =
          getTheWeightOfTheChildTasks / remainingTasks.length;
        let runningSum = 0;
        for (let i = 0; i < remainingTasks.length; i++) {
          const currentWeight = Number(remainingTasks[i].weight) || 0;

          if (i < remainingTasks.length - 1) {
            const newWeight = currentWeight + weightPerTask;
            remainingTasks[i].weight = Number(newWeight.toFixed(2));
            runningSum += remainingTasks[i].weight;
          } else {
            const lastTaskWeight = 100 - runningSum;
            remainingTasks[i].weight = Number(lastTaskWeight.toFixed(2));
          }
        }

        await planTaskRepository.save(remainingTasks);
      }
    } catch (error) {
      throw error;
    }
  }
}
