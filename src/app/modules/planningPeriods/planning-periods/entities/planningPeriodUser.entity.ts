import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { PlanningPeriod } from './planningPeriod.entity';

@Entity()
//@Unique(['planningPeriodId', 'userId', 'deletedAt'])
export class PlanningPeriodUser extends BaseModel {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  planningPeriodId: string;

  @ManyToOne(() => PlanningPeriod, (planningPeriod) => planningPeriod.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  planningPeriod: PlanningPeriod;
}
