import { BaseModel } from '@root/src/database/base.model';
import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';
import { ReportComment } from '../../report-comments/entities/report-comment.entity';
import { Report } from '../../okr-report/entities/okr-report.entity';
import { FailureReason } from '../../failure-reason/entities/failure-reason.entity';
import { PlanTask } from '../../plan-tasks/entities/plan-task.entity';

@Entity()
export class ReportTask extends BaseModel {
  @Column({
    type: 'enum',
    enum: ReportStatusEnum,
    default: ReportStatusEnum.Drafted,
  })
  status: ReportStatusEnum;

  @Column({ nullable: true })
  actualValue: string;

  @Column({ default: false })
  isAchieved: boolean;

  @Column({ nullable: false })
  tenantId: string; // This stores the foreign key for Tenant

  @Column({ nullable: true })
  customReason: string;

  @ManyToOne(() => Report, (report) => report.reportTask, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'reportId' }) // Ensure column matches your DB schema
  report: Report;

  @Column({ type: 'uuid', nullable: false })
  reportId: string;

  @ManyToOne(() => PlanTask, (plan) => plan.planTask, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    // eager: true,
  })
  planTask: PlanTask;

  @Column({ nullable: false })
  planTaskId: string;

  @ManyToOne(() => FailureReason, (failureReason) => failureReason.reportTask, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    // eager: true,
  })
  failureReason: FailureReason;

  @Column({ nullable: true })
  failureReasonId: string;

  // One report can have many comments
  @OneToMany(() => ReportComment, (reportComment) => reportComment.report, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    // eager: true,
  })
  comments: ReportComment[];
}
