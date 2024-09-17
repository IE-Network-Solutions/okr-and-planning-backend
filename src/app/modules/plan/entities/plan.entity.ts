import { BaseModel } from '@root/src/database/base.model';
import {
  Column,
  Entity,
  ManyToOne,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { PlanningPeriodUser } from '../../planningPeriods/planning-periods/entities/planningPeriodUser.entity';

@Entity()
@Tree('closure-table')
export class Plan extends BaseModel {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean' })
  isValidated: boolean;

  @Column({ type: 'boolean' })
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
  })
  planningUser: PlanningPeriodUser;
}
