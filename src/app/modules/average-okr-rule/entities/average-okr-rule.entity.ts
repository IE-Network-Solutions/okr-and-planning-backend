import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, Index, Unique } from 'typeorm';

@Entity()
@Unique(['title', 'tenantId'])
export class AverageOkrRule extends BaseModel {
  @Column({ type: 'varchar', nullable: false })
  title: string;
  @Column({ type: 'int' })
  myOkrPercentage: number;
  @Column({ type: 'int' })
  teamOkrPercentage: number;
  @Column({ type: 'uuid' })
  tenantId: string;
}
