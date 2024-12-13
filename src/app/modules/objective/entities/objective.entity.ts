import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { KeyResult } from '../../key-results/entities/key-result.entity';
@Entity()
export class Objective extends BaseModel {
  @Column({ type: 'varchar', length: '1000', nullable:false})
  title: string;
  @Column({ type: 'varchar', length: '255', nullable: true })
  objectiveId: string;
  @Column({ type: 'uuid' ,nullable:true})
  sessionId: string;
  @Column({ type: 'varchar', length: '255', nullable: true })
  description: string;
  @Column({ type: 'uuid' })
  userId: string;
  @Column({ type: 'date' })
  deadline: Date;
  @Column({ type: 'uuid', nullable: true })
  allignedKeyResultId: string;
  @Column({ type: 'uuid' })
  tenantId: string;
  @OneToMany(() => KeyResult, (key) => key.objective)
  keyResults: KeyResult[];
  @ManyToOne(() => KeyResult, (obj) => obj.obj)
  allignedKeyResult: KeyResult;
}
