import { BaseModel } from '@root/src/database/base.model';
import { Entity, Column, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';
import { ReportComment } from '../../report-comments/entities/report-comment.entity';
import { Report } from '../../okr-report/entities/okr-report.entity';
import { FailureReason } from '../../failure-reason/entities/failure-reason.entity';
import { Plan } from '../../okr-report/entities/mock-plan.entity';

@Entity()
export class ReportTask extends BaseModel {
  @Column()
  status: ReportStatusEnum;

  @Column()
  actualValue: string;

  @Column()
  isAchived: boolean;

  @Column({nullable: true})
  tenantId: string; // This stores the foreign key for Tenant

  @Column()
  customReason: string;

  // Many reports can belong to one Task
  @ManyToOne(() => Report, (report) => report.reportTask)
  report: Report;

  @Column({ nullable: true })
  reportId: string;

  @ManyToOne(() => Plan, (plan) => plan.planTask)
  planTask: Plan;

  @Column({ nullable: true })
  planTaskId: string;

  @ManyToOne(() => FailureReason, (failureReason) => failureReason.reportTask)
  failureReason: FailureReason;

  @Column({ nullable: true })
  failureReasonId: string;

  // One report can have many comments
  @OneToMany(() => ReportComment, (reportComment) => reportComment.report, { cascade: true })
  comments: ReportComment[];
}
