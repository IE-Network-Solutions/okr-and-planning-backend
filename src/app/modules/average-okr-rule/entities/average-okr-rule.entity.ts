import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, Index, Unique } from 'typeorm';

@Entity()
@Index(['title', 'tenantId'], { unique: true, where: 'deletedAt IS NULL' })
export class AverageOkrRule extends BaseModel {
  @Column({ type: 'varchar', nullable: false,})
  title: string;
  @Column({ type: 'int' })
  myOkrPercentage: number;
  @Column({ type: 'int' })
  teamOkrPercentage: number;
  @Column({ type: 'uuid' })
  tenantId: string;
}
