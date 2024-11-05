import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Plan } from '../../plan/entities/plan.entity';

@Entity()
export class PlanComment extends BaseModel {
  @Column({ type: 'uuid' })
  commentedBy: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'uuid' })
  tenantId: string;


  @Column({ type:'uuid',nullable:true })
  planId: string;

  @ManyToOne(() => Plan, (plan) => plan.comments, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  plan: Plan;
  
}
