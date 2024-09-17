import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity } from 'typeorm';

@Entity()
export class PlanningPeriodUser extends BaseModel {
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  planningPeriodId: string;

  @Column({ type: 'uuid' })
  tenantId: string;
}
