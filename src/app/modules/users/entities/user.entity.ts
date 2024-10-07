// import { BaseModel } from '@root/src/database/base.entity';
import { BaseModel } from '../../../../database/base.model';
import { Entity, Column, OneToMany } from 'typeorm';
import { ReportComment } from '../../report-comments/entities/report-comment.entity';
import { Report } from '../../okr-report/entities/okr-report.entity';

@Entity()
export class User extends BaseModel {
  @Column({ length: 500, type: 'varchar',nullable:true })
  name: string;
  @Column({ length: 500, type: 'varchar',nullable:true })
  nnnname: string;
  @Column({ nullable: true })
  myname: string;
  @Column({ length: 50, type: 'varchar',nullable:true })
  email: string;
  @Column({ nullable: true })
  myemailisababababba: string;

  @Column({ nullable: true })
  myemailishhh: string;

  @Column({ nullable: true })
  hhhhhhhemememem: string;

  @Column({ nullable: true })
  bbbbbbbbbbbbbbbbbbbbbb: string;

  // @OneToMany(() => ReportComment, (reportComment) => reportComment.user) // Correctly reference the user property in Report
  // reportComment: ReportComment[]; // Add this line to hold the reports related to the user
  // // Any other fields you need for reference

}
