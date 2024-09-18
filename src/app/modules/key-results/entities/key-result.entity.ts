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

@Entity()
export class KeyResult extends BaseModel {
  @Column({ type: 'uuid' })
  objectiveId: string;
  @Column({ type: 'varchar', length: '50' })
  title: string;
  @Column({ type: 'varchar', length: '50', nullable: true })
  description: string;
  @Column({ type: 'date' })
  deadline: Date;
  @Column({ type: 'varchar', nullable: true })
  metricTypeId: string;
  @Column({ type: 'int', nullable: true })
  initialValue: number;
  @Column({ type: 'int', nullable: true })
  targetValue: number;
  @Column({ type: 'int' })
  weight: number;
  @Column({ type: 'int', nullable: true })
  currentValue: number;
  @Column({ type: 'int', nullable: true })
  progress: number;
  @Column({ type: 'uuid' })
  tenantId: string;
  @ManyToOne(() => Objective, (obj) => obj.keyResults)
  @JoinColumn({ name: 'objectiveId' })
  objective: Objective;
  @OneToMany(() => Milestone, (mile) => mile.keyResult)
  milestones: Milestone[];

  @ManyToOne(() => MetricType, (metric) => metric.keyResults)
  metricType: MetricType;

  @OneToMany(() => Objective, (key) => key.allignedKeyResult)
  obj: Objective[];
}
