import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Project } from './Project';
import { User } from './User';

@Entity('project_members')
@Unique(['projectId', 'userId'])
export class ProjectMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  projectId!: number;

  @Column({ type: 'integer' })
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Project, (project) => project.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @ManyToOne(() => User, (user) => user.projectMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}

