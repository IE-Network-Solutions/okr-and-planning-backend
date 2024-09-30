import { BaseModel } from '@root/src/database/base.model';
import { Entity, Column, OneToOne } from 'typeorm';
import { Report } from './okr-report.entity';
import { ReportTask } from '../../okr-report-task/entities/okr-report-task.entity';

@Entity()
export class Plan extends BaseModel {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  // One-to-One relationship with Report (inverse side)
  @OneToOne(() => Report, (report) => report.plan)
  report: Report;

  @OneToOne(() => ReportTask, (reportTask) => reportTask.planTask)
  planTask: ReportTask;
}
