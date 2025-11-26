import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Project } from '../entities/Project';
import { ProjectMember } from '../entities/ProjectMember';
import { Task } from '../entities/Task';
import { Sprint } from '../entities/Sprint';
import { SprintMember } from '../entities/SprintMember';
import { Commitment } from '../entities/Commitment';
import { CommitmentParticipant } from '../entities/CommitmentParticipant';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DATABASE_URL?.replace('file:', '') || './database.sqlite',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Project,
    ProjectMember,
    Task,
    Sprint,
    SprintMember,
    Commitment,
    CommitmentParticipant,
  ],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: ['src/database/subscribers/**/*.ts'],
  extra: {
    enableWAL: true,
  },
});

