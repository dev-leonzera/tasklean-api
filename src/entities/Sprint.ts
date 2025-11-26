import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Project } from './Project';
import { SprintMember } from './SprintMember';
import { Task } from './Task';

@Entity('sprints')
export class Sprint {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', default: 'active' })
  status!: string;

  @Column({ type: 'datetime' })
  startDate!: Date;

  @Column({ type: 'datetime' })
  endDate!: Date;

  @Column({ type: 'integer' })
  projectId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Project, (project) => project.sprints, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @OneToMany(() => SprintMember, (member) => member.sprint)
  members!: SprintMember[];

  @OneToMany(() => Task, (task) => task.sprint)
  tasks!: Task[];
}

