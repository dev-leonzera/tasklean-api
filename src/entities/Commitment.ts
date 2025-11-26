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
import { CommitmentParticipant } from './CommitmentParticipant';

@Entity('commitments')
export class Commitment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'datetime' })
  date!: Date;

  @Column({ type: 'varchar' })
  startTime!: string;

  @Column({ type: 'varchar' })
  endTime!: string;

  @Column({ type: 'varchar', nullable: true })
  location!: string | null;

  @Column({ type: 'varchar', default: 'scheduled' })
  status!: string;

  @Column({ type: 'varchar', default: 'medium' })
  priority!: string;

  @Column({ type: 'varchar', nullable: true })
  reminder!: string | null;

  @Column({ type: 'integer', nullable: true })
  projectId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Project, (project) => project.commitments, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' })
  project!: Project | null;

  @OneToMany(() => CommitmentParticipant, (participant) => participant.commitment)
  participants!: CommitmentParticipant[];
}

