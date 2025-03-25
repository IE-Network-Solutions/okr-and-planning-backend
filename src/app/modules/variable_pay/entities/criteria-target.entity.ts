import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, ManyToOne } from 'typeorm';
import { VpCriteria } from './vp-criteria.entity';

@Entity()
export class CriteriaTarget extends BaseModel {
  @Column({ type: 'uuid', nullable: true })
  departmentId?: string;

  @Column({ type: 'uuid' })
  vpCriteriaId: string;

  @ManyToOne(() => VpCriteria, { onDelete: 'CASCADE' })
  vpCriteria: VpCriteria;

  @Column({ type: 'decimal', precision: 16, scale: 2, default: 1 })
  target: number;

  @Column({ type: 'varchar', nullable: true })
  month?: string;

  @Column({ type: 'uuid' })
  tenantId: string;
}
