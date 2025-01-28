import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, Unique } from 'typeorm';
import { IntervalHierarchy } from '../enum/interval-type.enum';

@Entity()
@Unique(['tenantId', 'name']) // Define composite unique constraint
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

  @Column({
    type: 'timestamp',
    nullable: true,
    default: '2024-10-30 18:38:43.12592',
  })
  submissionDeadline: Date; // Changed from 'interval' to 'timestamp'

  @Column({ type: 'varchar', nullable: true })
  actionOnFailure: string; // Fixed the typo
}
