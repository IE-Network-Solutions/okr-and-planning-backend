import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity } from 'typeorm';

@Entity()
export class PlanningPeriod extends BaseModel {
  @Column({ length: 500, type: 'varchar' })
  name: string;

  @Column({ type: 'uuid' })
  tenantId: string;
}
