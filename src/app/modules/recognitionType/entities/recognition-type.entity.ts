import { BaseModel } from '@root/src/database/base.model';
import { Entity, Column, OneToMany } from 'typeorm';
import { RecognitionTypeEnum } from '../enums/recognitionType.enum';
import { AppreciationLog } from '../../appreciationLog/entities/appreciation-log.entity';
import { ReprimandLog } from '../../reprimandLog/entities/reprimand.entity';

@Entity()
export class RecognitionType extends BaseModel {
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'bigint' })
  weight: number;

  @Column({
    type: 'enum',
    enum: RecognitionTypeEnum,
  })
  type: RecognitionTypeEnum;

  @Column({ type: 'uuid' })
  tenantId: string;

  @OneToMany(() => AppreciationLog, (appreciationLog) => appreciationLog.type)
  appreciationLogs: AppreciationLog[];

  @OneToMany(() => ReprimandLog, (appreciationLog) => appreciationLog.type)
  reprimandLogs: ReprimandLog[];
}
