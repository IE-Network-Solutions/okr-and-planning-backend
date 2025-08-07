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
  ValueTransformer,
} from 'typeorm';
import { KeyResult } from '../../key-results/entities/key-result.entity';
import { Milestone } from '../../milestones/entities/milestone.entity';

// export const bigintTransformer: ValueTransformer = {
//   to: (value: number | null): string | null =>
//     value !== null ? value.toString() : null,
//   from: (value: string | null): number | null =>
//     value !== null ? parseInt(value, 10) : null,
// };
export const decimalTransformer: ValueTransformer = {
  to: (value: number | null): string | null => {
    // Ensure that the value is not undefined before calling toString
    if (value !== null && value !== undefined) {
      return value.toString();
    }
    return null; // Return null if the value is null or undefined
  },
  from: (value: string | null): number | null => {
    // Ensure that the value is not null or undefined before parsing
    if (value !== null && value !== undefined) {
      return parseFloat(value);
    }
    return null; // Return null if the value is null or undefined
  },
};

@Entity()
@Tree('closure-table')
export class PlanTask extends BaseModel {
  @Column({ type: 'text', nullable: true })
  task: string;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority: Priority;

  @Column({
    type: 'decimal',
    precision: 16,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  targetValue: number;

  @Column({ type: 'decimal', precision: 16, scale: 2, default: 5 })
  weight: number;

  @TreeParent()
  parentTask: PlanTask;

  @TreeChildren()
  planTask: PlanTask[];

  @Column({ type: 'int' })
  level: number;

  //////////////// ahmed changes  ////////////////////////
  @Column({ type: 'uuid' })
  planId: string;

  @Column({ type: 'uuid', nullable: true })
  parentTaskId: string;

  @Column({ type: 'text', nullable: true })
  status: string;

  @Column({ type: 'boolean', default: false })
  achieveMK: boolean;

  @Column({ type: 'int', default: 0 })
  actualValue: number;

  ///////////////////////////////
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

  @Column()
  keyResultId: string;

  @ManyToOne(() => Milestone, (milestone) => milestone.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    nullable: true,
    eager: true,
  })
  milestone: Milestone;

  @Column({ nullable: true })
  milestoneId: string;
}
