import { BaseModel } from '@root/src/database/base.model';
import { Plan } from '../../plan/entities/plan.entity';
import { Priority } from './priority.enum';
import {
  Column,
  Entity,
  ManyToOne,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Entity()
@Tree('closure-table')
export class PlanTask extends BaseModel {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text', nullable: true })
  task: string;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority: Priority;

  @Column({ type: 'int', nullable: true })
  targetValue: number;

  @TreeParent()
  parentTask: PlanTask;

  @TreeChildren()
  planTask: PlanTask[];

  @Column({ type: 'int' })
  level: number;

  @ManyToOne(() => Plan, (plan) => plan.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  plan: Plan;
}
