import { BaseModel } from '@root/src/database/base.model';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Objective } from '../../objective/entities/objective.entity';
import { Milestone } from '../../milestones/entities/milestone.entity';
import { MetricType } from '../../metric-types/entities/metric-type.entity';
import { Max, Min } from 'class-validator';

@Entity()
export class KeyResult extends BaseModel {
  @Column({ type: 'uuid' })
  objectiveId: string;
  @Column({ type: 'varchar', length: '255', nullable: true })
  keyResultId: string;
  @Column({ type: 'varchar', length: '1000' })
  title: string;
  @Column({ type: 'varchar', length: '255', nullable: true })
  description: string;
  @Column({ type: 'date' })
  deadline: Date;
  @Column({ type: 'varchar', nullable: true })
  metricTypeId: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  initialValue: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  targetValue: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentValue: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lastUpdateValue: number;
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  @Min(0)
  @Max(100)
  progress: number;
  @Column({ type: 'uuid' })
  tenantId: string;
  @ManyToOne(() => Objective, (obj) => obj.keyResults)
  @JoinColumn({ name: 'objectiveId' })
  objective: Objective;
  @OneToMany(() => Milestone, (mile) => mile.keyResult)
  milestones: Milestone[];

  @ManyToOne(() => MetricType, (metric) => metric.keyResults, {
    eager: true,
  })
  metricType: MetricType;

  @OneToMany(() => Objective, (key) => key.allignedKeyResult)
  obj: Objective[];
}
