import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity } from 'typeorm';
import { IntervalHierarchy } from '../enum/interval-type.enum';

@Entity()
export class PlanningPeriod extends BaseModel {
  @Column({ length: 500, type: 'varchar' })
  name: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: IntervalHierarchy,
    nullable: true,
  })
  intervalLength: IntervalHierarchy;

  @Column({ type: 'varchar' })
  intervalType: string; // Ensure the type matches your application's requirements

  @Column({ type: 'timestamp', nullable: true })
  submissionDeadline: Date; // Changed from 'interval' to 'timestamp'

  @Column({ type: 'varchar', nullable: true })
  actionOnFailure: string; // Fixed the typo
}
