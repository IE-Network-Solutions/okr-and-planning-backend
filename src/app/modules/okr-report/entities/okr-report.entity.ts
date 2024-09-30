import { BaseModel } from '@root/src/database/base.model';
import { Entity, Column, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Tenant } from './mock-tenant.entity';
import { Plan } from './mock-plan.entity';
import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';
import { User } from './mock-user.entity';
import { ReportComment } from '../../report-comments/entities/report-comment.entity';
import { ReportTask } from '../../okr-report-task/entities/okr-report-task.entity';

@Entity()
export class Report extends BaseModel {
  @Column()
  status: ReportStatusEnum;

  @Column()
  reportScore: string;

  @Column()
  reportTitle: string;

  // One-to-One relationship with Plan
  @OneToOne(() => Plan, (plan) => plan.report, { onDelete: 'CASCADE' })
  @JoinColumn() // Required for the owning side of the relationship
  plan: Plan;

  // Many reports can belong to one Tenant
  @ManyToOne(() => Tenant, (tenant) => tenant.reports, { onDelete: 'CASCADE' })
  tenant: Tenant;

  @Column()
  tenantId: string; // This stores the foreign key for Tenant

  // Many reports can belong to one User
  @ManyToOne(() => User, (user) => user.reports, { onDelete: 'CASCADE' })
  user: User;

  @Column({ nullable: true })
  userId: string; // This stores the foreign key for User

  // One report can have many comments
  @OneToMany(() => ReportComment, (reportComment) => reportComment.report, { cascade: true })
  comments: ReportComment[];

  @OneToMany(() => ReportTask, (ReportTask) => ReportTask.report)
  reportTask: ReportTask[];
}
