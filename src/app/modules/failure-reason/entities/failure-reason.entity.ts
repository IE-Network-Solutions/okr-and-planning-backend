import { BaseModel } from '@root/src/database/base.model';
import { Entity, Column, OneToOne } from 'typeorm';
import { ReportTask } from '../../okr-report-task/entities/okr-report-task.entity';
import { ReportStatusEnum } from '@root/src/core/interfaces/reportStatus.type';

@Entity()
export class FailureReason extends BaseModel {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  tenantId: string; // This stores the foreign key for Tenant

  @OneToOne(() => ReportTask, (reportTask) => reportTask.failureReason,{
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    // eager: true,
  })
  reportTask: ReportTask;
}