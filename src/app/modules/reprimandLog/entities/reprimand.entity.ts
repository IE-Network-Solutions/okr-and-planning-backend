import { BaseModel } from '@root/src/database/base.model';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RecognitionType } from '../../recognitionType/entities/recognition-type.entity';
import { CarbonCopyLog } from '../../carbonCopyLlog/entities/carbon-copy-log.entity';

@Entity()
export class ReprimandLog extends BaseModel {
  @Column({ type: 'text' })
  action: string;

  @Column({ type: 'uuid' })
  recipientId: string;

  @Column({ type: 'uuid' })
  issuerId: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  typeId: string;

  @ManyToOne(
    () => RecognitionType,
    (recognitionType) => recognitionType.reprimandLogs,
  )
  @JoinColumn({ name: 'typeId' })
  type: RecognitionType;

  @OneToMany(() => CarbonCopyLog, (carbonCopyLog) => carbonCopyLog.reprimandLog)
  carbonCopies: CarbonCopyLog[];
}
