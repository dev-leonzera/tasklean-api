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
import { User } from './User';
import { ProjectMember } from './ProjectMember';
import { Task } from './Task';
import { Sprint } from './Sprint';
import { Commitment } from './Commitment';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'varchar', default: 'starting' })
  status!: string;

  @Column({ type: 'varchar', default: '#3B82F6' })
  color!: string;

  @Column({ type: 'datetime', nullable: true })
  dueDate!: Date | null;

  @Column({ type: 'integer' })
  ownerId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.projects)
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @OneToMany(() => ProjectMember, (member) => member.project)
  members!: ProjectMember[];

  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];

  @OneToMany(() => Sprint, (sprint) => sprint.project)
  sprints!: Sprint[];

  @OneToMany(() => Commitment, (commitment) => commitment.project)
  commitments!: Commitment[];
}

