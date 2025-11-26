import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './Project';
import { User } from './User';
import { Sprint } from './Sprint';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', default: 'todo' })
  status!: string;

  @Column({ type: 'varchar', default: 'medium' })
  priority!: string;

  @Column({ type: 'datetime', nullable: true })
  dueDate!: Date | null;

  @Column({ type: 'integer', default: 0 })
  comments!: number;

  @Column({ type: 'integer', default: 0 })
  attachments!: number;

  @Column({ type: 'integer', nullable: true })
  projectId!: number | null;

  @Column({ type: 'integer', nullable: true })
  assigneeId!: number | null;

  @Column({ type: 'integer', nullable: true })
  sprintId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' })
  project!: Project | null;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigneeId' })
  assignee!: User | null;

  @ManyToOne(() => Sprint, (sprint) => sprint.tasks, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sprintId' })
  sprint!: Sprint | null;
}

