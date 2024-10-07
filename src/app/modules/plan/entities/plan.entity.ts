import { BaseModel } from '@root/src/database/base.model';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { PlanningPeriodUser } from '../../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { PlanTask } from '../../plan-tasks/entities/plan-task.entity';
import { PlanComment } from '../../plan-comments/entities/plan-comment.entity';

@Entity()
@Tree('closure-table')
export class Plan extends BaseModel {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', nullable: true })
  isValidated: boolean;

  @Column({ type: 'boolean', nullable: true })
  isReported: boolean;

  @TreeChildren()
  plan: Plan[];

  @TreeParent()
  parentPlan: Plan;

  @Column({ type: 'int' })
  level: number;

  @ManyToOne(() => PlanningPeriodUser, (planningUser) => planningUser.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  planningUser: PlanningPeriodUser;

  @OneToMany(() => PlanTask, (planTask) => planTask.plan, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  tasks: PlanTask[];

  @OneToMany(() => PlanComment, (planComment) => planComment.plan, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  comments: PlanComment[];
}
