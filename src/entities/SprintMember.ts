import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Sprint } from './Sprint';
import { User } from './User';

@Entity('sprint_members')
@Unique(['sprintId', 'userId'])
export class SprintMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  sprintId!: number;

  @Column({ type: 'integer' })
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Sprint, (sprint) => sprint.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sprintId' })
  sprint!: Sprint;

  @ManyToOne(() => User, (user) => user.sprintMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}

