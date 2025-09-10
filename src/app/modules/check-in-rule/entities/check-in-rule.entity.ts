import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AppliesTo } from '../enum/applies-to.enum';
import { Operation } from '../enum/operation.enum';

@Entity()
export class CheckInRule extends BaseModel {
  @Column({ length: 500, type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AppliesTo,
  })
  appliesTo: AppliesTo;

  @Column({ type: 'uuid' })
  planningPeriodId: string;

  @ManyToOne('PlanningPeriod')
  @JoinColumn({ name: 'planningPeriodId' })
  planningPeriod: any;

  @Column({ type: 'boolean', default: false })
  timeBased: boolean;

  @Column({ type: 'boolean', default: false })
  achievementBased: boolean;

  @Column({ type: 'int' })
  frequency: number;

  @Column({
    type: 'enum',
    enum: Operation,
    nullable: true,
  })
  operation?: Operation;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column({ type: 'uuid' })
  feedbackId: string;

  @Column({ type: 'decimal', nullable: true })
  target: number;

  @Column({ type: 'json', nullable: true })
  targetDate: Array<{
    date: string;          // "monday" - the day this rule applies to
    startDay: string;      // "monday"
    startTime: string;     // "03:00"
    endDay: string;        // "monday" or "saturday"
    endTime: string;       // "03:00" or "16:00"
  }>;

  @Column({ type: 'json', nullable: true })
  userIds: string[];
} 