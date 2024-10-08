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
  @Column({ type: 'enum', enum: ReportStatusEnum, nullable: true })
  status: ReportStatusEnum;

  @Column()
  reportScore: string;

  @Column()
  reportTitle: string;

  @OneToOne(() => Plan, (plan) => plan.report, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  // @JoinColumn()
  // plan: Plan;
  @OneToOne(() => Plan, (plan) => plan.plan, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    // eager: true,
  })
  plan: Plan;

  @Column({ nullable: true })
  planId: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @Column({ nullable: true })
  userId: string;

  @OneToMany(() => ReportComment, (reportComment) => reportComment.report, {
    cascade: true,
  })
  comments: ReportComment[];

  @OneToMany(() => ReportTask, (reportTask) => reportTask.report)
  reportTask: ReportTask[];
}
