import { BaseModel } from "@root/src/database/base.model";
import { Column, Entity, OneToMany } from "typeorm";
import { Report } from "./okr-report.entity";

@Entity()
export class Tenant extends BaseModel {

 @Column({nullable:true })
  name: string;

  @Column({ unique: true })
  email: string;

  // Relationship: One Tenant can have multiple Reports
  @OneToMany(() => Report, (report) => report.tenant)
  reports: Report[];
  // Any other fields you need for reference
}
