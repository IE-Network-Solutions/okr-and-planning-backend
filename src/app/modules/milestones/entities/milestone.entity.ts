import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Status } from '../enum/milestone.status.enum';
import { KeyResult } from '../../key-results/entities/key-result.entity';

@Entity()
export class Milestone extends BaseModel {
  @Column({ type: 'uuid' })
  keyResultId: string;
  @Column({ type: 'varchar', length: '500', nullable: false })
  title: string;
  @Column({ type: 'varchar', length: '255', nullable: true })
  description: string;
  @Column({ nullable: true })
  status: Status;
  @Column({ type: 'int' })
  weight: number;
  @Column({ type: 'uuid' })
  tenantId: string;
  @ManyToOne(() => KeyResult, (key) => key.milestones)
  @JoinColumn({ name: 'keyResultId' })
  keyResult: KeyResult;
}
