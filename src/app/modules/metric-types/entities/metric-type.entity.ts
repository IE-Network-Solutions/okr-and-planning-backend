import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, OneToMany } from 'typeorm';
import { KeyResult } from '../../key-results/entities/key-result.entity';
import { NAME } from '../enum/metric-type.enum';

@Entity()
export class MetricType extends BaseModel {
  @Column({ type: 'varchar', nullable: true })
  name: NAME;
  @Column({ type: 'varchar', length: '255' })
  description: string;
  @OneToMany(() => KeyResult, (key) => key.metricType)
  keyResults: KeyResult[];
}
