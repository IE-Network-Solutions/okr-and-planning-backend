import { Entity, Column, ManyToOne } from 'typeorm';
import { Report } from '../../okr-report/entities/okr-report.entity';
import { BaseModel } from '@root/src/database/base.model';

@Entity()
export class ReportComment extends BaseModel {
  @Column('text')
  comment: string;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => Report, (report) => report.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  report: Report;

  @Column({ nullable: true })
  reportId: string;

  @Column({ nullable: true })
  commentedBy: string;
}
