import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './Project';
import { Task } from './Task';
import { ProjectMember } from './ProjectMember';
import { SprintMember } from './SprintMember';
import { CommitmentParticipant } from './CommitmentParticipant';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Project, (project) => project.owner)
  projects!: Project[];

  @OneToMany(() => Task, (task) => task.assignee)
  tasks!: Task[];

  @OneToMany(() => ProjectMember, (member) => member.user)
  projectMemberships!: ProjectMember[];

  @OneToMany(() => SprintMember, (member) => member.user)
  sprintMemberships!: SprintMember[];

  @OneToMany(() => CommitmentParticipant, (participant) => participant.user)
  commitmentParticipants!: CommitmentParticipant[];
}

