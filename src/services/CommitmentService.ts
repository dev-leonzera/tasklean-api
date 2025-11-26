import { AppDataSource } from '../config/database';
import { Commitment } from '../entities/Commitment';
import { CommitmentParticipant } from '../entities/CommitmentParticipant';
import { CreateCommitmentDto, UpdateCommitmentDto } from '../types';

export class CommitmentService {
  private commitmentRepository = AppDataSource.getRepository(Commitment);
  private commitmentParticipantRepository = AppDataSource.getRepository(CommitmentParticipant);

  async findAll(filters?: {
    projectId?: number;
    status?: string;
    priority?: string;
    date?: string;
  }) {
    let queryBuilder = this.commitmentRepository
      .createQueryBuilder('commitment')
      .leftJoinAndSelect('commitment.project', 'project')
      .leftJoinAndSelect('commitment.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .orderBy('commitment.date', 'ASC')
      .addOrderBy('commitment.startTime', 'ASC');

    if (filters?.projectId) {
      queryBuilder = queryBuilder.where('commitment.projectId = :projectId', {
        projectId: filters.projectId,
      });
    }

    if (filters?.status) {
      queryBuilder = queryBuilder.andWhere('commitment.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.priority) {
      queryBuilder = queryBuilder.andWhere('commitment.priority = :priority', {
        priority: filters.priority,
      });
    }

    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      queryBuilder = queryBuilder.andWhere('commitment.date BETWEEN :startDate AND :endDate', {
        startDate: startOfDay,
        endDate: endOfDay,
      });
    }

    return queryBuilder.getMany();
  }

  async findById(id: number) {
    return this.commitmentRepository.findOne({
      where: { id },
      relations: ['project', 'participants', 'participants.user'],
    });
  }

  async create(data: CreateCommitmentDto) {
    const commitment = this.commitmentRepository.create({
      title: data.title,
      description: data.description || null,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location || null,
      status: data.status || 'scheduled',
      priority: data.priority || 'medium',
      reminder: data.reminder || null,
      projectId: data.projectId || null,
    });

    const savedCommitment = await this.commitmentRepository.save(commitment);

    if (data.participants && data.participants.length > 0) {
      const participants = data.participants.map(userId =>
        this.commitmentParticipantRepository.create({
          commitmentId: savedCommitment.id,
          userId,
        })
      );
      await this.commitmentParticipantRepository.save(participants);
    }

    return this.findById(savedCommitment.id);
  }

  async update(id: number, data: UpdateCommitmentDto) {
    const commitment = await this.findById(id);
    if (!commitment) {
      throw new Error('Commitment not found');
    }

    Object.assign(commitment, {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.date && { date: new Date(data.date) }),
      ...(data.startTime && { startTime: data.startTime }),
      ...(data.endTime && { endTime: data.endTime }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.reminder !== undefined && { reminder: data.reminder }),
      ...(data.projectId !== undefined && { projectId: data.projectId }),
    });

    return this.commitmentRepository.save(commitment);
  }

  async delete(id: number) {
    const commitment = await this.findById(id);
    if (!commitment) {
      throw new Error('Commitment not found');
    }

    await this.commitmentRepository.remove(commitment);
  }

  async addParticipant(commitmentId: number, userId: number) {
    const existing = await this.commitmentParticipantRepository.findOne({
      where: { commitmentId, userId },
    });

    if (existing) {
      throw new Error('User is already a participant of this commitment');
    }

    const participant = this.commitmentParticipantRepository.create({
      commitmentId,
      userId,
    });

    return this.commitmentParticipantRepository.save(participant);
  }

  async removeParticipant(commitmentId: number, userId: number) {
    const participant = await this.commitmentParticipantRepository.findOne({
      where: { commitmentId, userId },
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    await this.commitmentParticipantRepository.remove(participant);
  }
}

