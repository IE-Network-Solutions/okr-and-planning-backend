import { BaseModel } from '@root/src/database/base.model';
import { Column, Entity } from 'typeorm';
import { WeeklyPriorityTask } from './weekly-priority-task.entity';
import { OneToMany } from 'typeorm';

@Entity()
export class WeeklyPriorityWeek extends BaseModel {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'int' })
  count: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @OneToMany(() => WeeklyPriorityTask, (task) => task.weeklyPriorityWeek)
  tasks: WeeklyPriorityTask[];
}
