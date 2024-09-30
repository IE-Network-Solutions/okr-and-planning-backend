import { BaseModel } from "@root/src/database/base.model";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../okr-report/entities/mock-user.entity";
import { Report } from "../../okr-report/entities/okr-report.entity";
// Assuming you have a Report entity
@Entity()
export class ReportComment extends BaseModel {
  @Column({ length: 500, type: 'varchar' })
  name: string;

  // Change 'longtext' to 'text' for PostgreSQL compatibility
  @Column({ type: "text" })
  commentText: string;

  @ManyToOne(() => Report, (report) => report.comments, { onDelete: 'CASCADE' }) // Use report.comments
  @JoinColumn({ name: 'reportId' })
  report: Report;

  @ManyToOne(() => User, (user) => user.reportComment, { onDelete: 'CASCADE' }) // Ensure correct inverse property
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  tenantId: string;

  @Column({ nullable: true })
  additionalInfo: string; 
}