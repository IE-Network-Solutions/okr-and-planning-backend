import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
@Entity()
export class Client extends BaseModel {
  @Column({ length: 500, type: 'varchar' })
  name: string;

  @Column({ length: 50, type: 'varchar' })
  email: string;

  @Column({ length: 50, type: 'varchar' })
  phoneNumber: string;

  @Column({ length: 50, type: 'varchar' })
  slslslslls: string;
  @Column({ length: 50, type: 'varchar' })
  contactInfokkkk: string;

  @Column({ type: 'date' })
  licenseDate: Date;
  @Column({ length: 50, type: 'varchar' })
  status: string;
  @OneToMany(() => Product, (product) => product.client)
  products: Product[];
  @Column({ nullable: true })
  myemailiscute: string;

  //packageID: integer

  //databaseID: integer
}
