import { BaseModel } from '@root/src/database/base.model';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ReprimandLog } from '../../reprimandLog/entities/reprimand.entity';
import { AppreciationLog } from '../../appreciationLog/entities/appreciation-log.entity';

@Entity()
export class CarbonCopyLog extends BaseModel {
  @Column({ type: 'uuid' })
  copyUserId: string;

  @Column({ type: 'uuid', nullable: true })
  reprimandLogId?: string;

  @Column({ type: 'uuid', nullable: true })
  appreciationLogId?: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => ReprimandLog, (reprimandLog) => reprimandLog.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'reprimandLogId' })
  reprimandLog?: ReprimandLog;

  @ManyToOne(() => AppreciationLog, (appreciationLog) => appreciationLog.id, {
    nullable: true,
  })
  @JoinColumn({ name: 'appreciationLogId' })
  appreciationLog?: AppreciationLog;
}
