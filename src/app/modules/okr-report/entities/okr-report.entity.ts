import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Plan } from '../../plan/entities/plan.entity';
import { ReportComment } from '../../report-comments/entities/report-comment.entity';
import { ReportTask } from '../../okr-report-task/entities/okr-report-task.entity';
import { BaseModel } from '@root/src/database/base.model';
import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';

@Entity()
export class Report extends BaseModel {
  @Column({ type: 'enum', enum: ReportStatusEnum})
  status: ReportStatusEnum;
  
  @Column({ type: 'boolean', default: false })
  isValidated: boolean;
  
  @Column()
  reportScore: string;

  @Column()
  reportTitle: string;

  @Column({ type: 'uuid', nullable: true })
  sessionId: string;

  @OneToOne(() => Plan, (plan) => plan.report, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @Column({ nullable: true })
  planId: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => Plan, (plan) => plan.plan, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    // eager: true,
  })
  @JoinColumn({ name: 'planId' })
  // plan: Plan;
  plan: Plan;
  @OneToMany(() => ReportComment, (reportComment) => reportComment.report, {
    cascade: true,
  })
  comments: ReportComment[];

  @OneToMany(() => ReportTask, (reportTask) => reportTask.report, {
    cascade: true,
  })
  reportTask: ReportTask[];
}
