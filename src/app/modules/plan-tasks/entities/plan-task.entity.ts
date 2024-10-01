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
import { KeyResult } from '../../key-results/entities/key-result.entity';
import { Milestone } from '../../milestones/entities/milestone.entity';

@Entity()
@Tree('closure-table')
export class PlanTask extends BaseModel {
  @Column({ type: 'text', nullable: true })
  task: string;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority: Priority;

  @Column({ type: 'bigint', nullable: true })
  targetValue: number;

  @Column({ type: 'int', nullable: true })
  weight: number;

  @TreeParent()
  parentTask: PlanTask;

  @TreeChildren()
  planTask: PlanTask[];

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Plan, (plan) => plan.tasks, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  plan: Plan;

  @ManyToOne(() => KeyResult, (keyResult) => keyResult.id, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    nullable: false,
    eager: true,
  })
  keyResult: KeyResult;

  @ManyToOne(() => Milestone, (milestone) => milestone.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
    eager: true,
  })
  milestone: Milestone;
}
