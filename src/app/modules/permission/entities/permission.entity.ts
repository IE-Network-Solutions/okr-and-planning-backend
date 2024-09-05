// import { BaseModel } from 'src/database/base.entity';
import { Entity, Column } from 'typeorm';
import { BaseModel } from '../../../../database/base.model';
/** This is a TypeScript class representing a Permission entity with an id and a unique name and slug columns. */
@Entity()
export class Permission extends BaseModel {
  @Column({ unique: true, nullable: false })
  nameeee: string;
  @Column({ unique: true, nullable: false })
  slug: string;
}
