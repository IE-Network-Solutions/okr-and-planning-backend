import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity } from 'typeorm';

@Entity()
export class PlanningPeriod extends BaseModel {
  @Column({ length: 500, type: 'varchar' })
  name: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'interval' })
  intervalLength: string;

  @Column({ type: 'varchar' })
  intervalType: string;

  @Column({ type: 'interval' })
  submissionDeadline: string;

  @Column({ type: 'varchar', nullable: true })
  actionOnFailure: string;
}
