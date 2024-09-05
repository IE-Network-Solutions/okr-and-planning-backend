import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
// import { BaseModel } from '@root/src/database/base.entity';
import { User } from '../../users/entities/user.entity';
import { BaseModel } from '../../../../database/base.model';
import { Client } from '../../clients/entities/client.entity';

@Entity()
export class Product extends BaseModel {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  pictureUrl: string;

  @Column()
  category: string;
  @Column({ nullable: true })
  categoryyyyy: string;

  @Column({ nullable: true })
  categorseluuuuuuuuuamamam: string;
  @Column({ nullable: true })
  slslsleiefselmamamandselamfffueu: string;
  @Column({ nullable: true })
  getetetet: string;
  @Column('numeric', { scale: 2 })
  price: number;
  @Column('numeric', { scale: 2 })
  pricjjjjjjjjjjjjjjjjje: number;

  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => Client, (user) => user.products)
  @JoinColumn({ name: 'clientId', referencedColumnName: 'id' })
  client: User;

  @Column({ nullable: true })
  clientId: string;
}
