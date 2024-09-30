import { BaseModel } from '@root/src/database/base.model';
import { Entity, Column, OneToMany } from 'typeorm';
import { Report } from './okr-report.entity';
import { ReportComment } from '../../report-comments/entities/report-comment.entity';

@Entity()
export class User extends BaseModel {

  @Column({nullable:true})
  name: string;

  @Column({ unique: true,nullable:true })
  email: string;

  @OneToMany(() => Report, (report) => report.user) // Correctly reference the user property in Report
  reports: Report[]; // Add this line to hold the reports related to the user

  @OneToMany(() => ReportComment, (reportComment) => reportComment.user) // Correctly reference the user property in Report
  reportComment: ReportComment[]; // Add this line to hold the reports related to the user
  // Any other fields you need for reference
}
