import { Injectable } from '@nestjs/common';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  SoftRemoveEvent,
} from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { Report } from '../../okr-report/entities/okr-report.entity';
import { PlanTask } from '../../plan-tasks/entities/plan-task.entity';
import { getConnection } from 'typeorm';

@EventSubscriber()
@Injectable()
export class PlanSubscriber implements EntitySubscriberInterface<Plan> {
  listenTo() {
    return Plan;
  }

  async afterSoftRemove(event: SoftRemoveEvent<Plan>) {
    const plan = event.entity;

    const reportRepository = event.connection.getRepository(Report);
    const planTaskRepository = event.connection.getRepository(PlanTask);
    const planRepository = event.connection.getRepository(Plan);

    const queryRunner = event.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reports = await reportRepository.find({ where: { planId: plan.id } });
      const planTasks = await planTaskRepository.find({ where: { planId: plan.id } });
      const parentPlans = await planRepository.find({ where: { parentPlanId: plan.id } });

      if (parentPlans.length > 0) {
        await queryRunner.manager.softRemove(parentPlans);
      }
      if (planTasks.length > 0) {
        await queryRunner.manager.softRemove(planTasks);
      }
      if (reports.length > 0) {
        await queryRunner.manager.softRemove(reports);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error; // Re-throw for further handling if needed
    } finally {
      await queryRunner.release();
    }
  }
}