import { AppDataSource } from '../config/database';
import { Sprint } from '../entities/Sprint';
import { SprintMember } from '../entities/SprintMember';
import { CreateSprintDto, UpdateSprintDto } from '../types';

export class SprintService {
  private sprintRepository = AppDataSource.getRepository(Sprint);
  private sprintMemberRepository = AppDataSource.getRepository(SprintMember);

  async findAll(filters?: { projectId?: number; status?: string }) {
    const where: any = {};
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.status) where.status = filters.status;

    return this.sprintRepository.find({
      where,
      relations: ['project', 'members', 'members.user', 'tasks'],
      order: { startDate: 'DESC' },
    });
  }

  async findById(id: number) {
    return this.sprintRepository.findOne({
      where: { id },
      relations: ['project', 'members', 'members.user', 'tasks'],
    });
  }

  async create(data: CreateSprintDto) {
    const sprint = this.sprintRepository.create({
      name: data.name,
      status: data.status || 'active',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      projectId: data.projectId,
    });

    const savedSprint = await this.sprintRepository.save(sprint);

    if (data.members && data.members.length > 0) {
      const members = data.members.map(userId =>
        this.sprintMemberRepository.create({
          sprintId: savedSprint.id,
          userId,
        })
      );
      await this.sprintMemberRepository.save(members);
    }

    return this.findById(savedSprint.id);
  }

  async update(id: number, data: UpdateSprintDto) {
    const sprint = await this.findById(id);
    if (!sprint) {
      throw new Error('Sprint not found');
    }

    Object.assign(sprint, {
      ...(data.name && { name: data.name }),
      ...(data.status && { status: data.status }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
    });

    return this.sprintRepository.save(sprint);
  }

  async delete(id: number) {
    const sprint = await this.findById(id);
    if (!sprint) {
      throw new Error('Sprint not found');
    }

    await this.sprintRepository.remove(sprint);
  }

  async addMember(sprintId: number, userId: number) {
    const existing = await this.sprintMemberRepository.findOne({
      where: { sprintId, userId },
    });

    if (existing) {
      throw new Error('User is already a member of this sprint');
    }

    const member = this.sprintMemberRepository.create({
      sprintId,
      userId,
    });

    return this.sprintMemberRepository.save(member);
  }

  async removeMember(sprintId: number, userId: number) {
    const member = await this.sprintMemberRepository.findOne({
      where: { sprintId, userId },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    await this.sprintMemberRepository.remove(member);
  }
}

