import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Status } from '../enums/status.enum';
import { WeeklyPriorityWeek } from './weekly-priority-week.entity';

@Entity()
export class WeeklyPriorityTask extends BaseModel {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'uuid' })
  departmentId: string;

  @Column({ type: 'uuid', nullable: true })
  planId: string;

  @Column({ type: 'uuid', nullable: true })
  taskId: string;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;

  @Column({ type: 'varchar', nullable: true })
  month?: string;

  @Column({ type: 'varchar', nullable: true })
  session?: string;

  @Column({ type: 'varchar', nullable: true })
  failureReason?: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(
    () => WeeklyPriorityWeek,
    (weeklyPriorityWeek) => weeklyPriorityWeek.tasks,
    { eager: true },
  )
  weeklyPriorityWeek: WeeklyPriorityWeek;
}
