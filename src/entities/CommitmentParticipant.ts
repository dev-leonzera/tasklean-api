import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Commitment } from './Commitment';
import { User } from './User';

@Entity('commitment_participants')
@Unique(['commitmentId', 'userId'])
export class CommitmentParticipant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  commitmentId!: number;

  @Column({ type: 'integer' })
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Commitment, (commitment) => commitment.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commitmentId' })
  commitment!: Commitment;

  @ManyToOne(() => User, (user) => user.commitmentParticipants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}

