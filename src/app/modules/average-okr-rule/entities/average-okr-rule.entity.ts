import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity } from 'typeorm';

@Entity()
export class AverageOkrRule extends BaseModel {
  @Column({ type: 'varchar', nullable: false,unique:true })
  title: string;
  @Column({ type: 'int' })
  myOkrPercentage: number;
  @Column({ type: 'int' })
  teamOkrPercentage: number;
  @Column({ type: 'uuid' })
  tenantId: string;
}
