import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, ManyToOne } from 'typeorm';
import { PlanningPeriod } from './planningPeriod.entity';

@Entity()
export class PlanningPeriodUser extends BaseModel {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => PlanningPeriod, (planningPeriod) => planningPeriod.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  planningPeriod: PlanningPeriod;
}
