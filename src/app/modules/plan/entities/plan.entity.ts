import { BaseModel } from '@root/src/database/base.model';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { PlanningPeriodUser } from '../../planningPeriods/planning-periods/entities/planningPeriodUser.entity';
import { PlanTask } from '../../plan-tasks/entities/plan-task.entity';
import { PlanComment } from '../../plan-comments/entities/plan-comment.entity';
import { ReportTask } from '../../okr-report-task/entities/okr-report-task.entity';
import { Report } from '../../okr-report/entities/okr-report.entity';

@Entity()
@Tree('closure-table')
export class Plan extends BaseModel {
  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean',default:false })
  isValidated: boolean;

  @Column({ type: 'boolean',default:false})
  isReported: boolean;

  @TreeChildren()
  plan: Plan[];

  @TreeParent()
  parentPlan: Plan;

  @Column({ type: 'int', nullable: true })
  level: number;

  @ManyToOne(() => PlanningPeriodUser, (planningUser) => planningUser.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  planningUser: PlanningPeriodUser;

  @Column({ type: 'uuid', nullable: true })
  planningUserId: string;

  @OneToMany(() => PlanTask, (planTask) => planTask.plan, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  tasks: PlanTask[];

  @OneToMany(() => PlanComment, (planComment) => planComment.plan, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  comments: PlanComment[];

  @OneToOne(() => Report, (report) => report.plan)
  report: Report;

  @OneToOne(() => ReportTask, (reportTask) => reportTask.planTask)
  planTask: ReportTask;
}
