import { AppDataSource } from '../config/database';
import { Project } from '../entities/Project';
import { ProjectMember } from '../entities/ProjectMember';
import { CreateProjectDto, UpdateProjectDto } from '../types';

export class ProjectService {
  private projectRepository = AppDataSource.getRepository(Project);
  private projectMemberRepository = AppDataSource.getRepository(ProjectMember);

  async findAll() {
    return this.projectRepository.find({
      relations: ['owner', 'members', 'members.user', 'tasks'],
    });
  }

  async findById(id: number) {
    return this.projectRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user', 'tasks', 'sprints', 'commitments'],
    });
  }

  async create(data: CreateProjectDto) {
    const project = this.projectRepository.create({
      name: data.name,
      description: data.description || '',
      status: data.status || 'starting',
      color: data.color || '#3B82F6',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      ownerId: data.ownerId,
    });

    const savedProject = await this.projectRepository.save(project);

    if (data.members && data.members.length > 0) {
      const members = data.members.map(userId =>
        this.projectMemberRepository.create({
          projectId: savedProject.id,
          userId,
        })
      );
      await this.projectMemberRepository.save(members);
    }

    return this.findById(savedProject.id);
  }

  async update(id: number, data: UpdateProjectDto) {
    const project = await this.findById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    Object.assign(project, {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.color && { color: data.color }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
    });

    return this.projectRepository.save(project);
  }

  async delete(id: number) {
    const project = await this.findById(id);
    if (!project) {
      throw new Error('Project not found');
    }

    await this.projectRepository.remove(project);
  }

  async addMember(projectId: number, userId: number) {
    const existing = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    if (existing) {
      throw new Error('User is already a member of this project');
    }

    const member = this.projectMemberRepository.create({
      projectId,
      userId,
    });

    return this.projectMemberRepository.save(member);
  }

  async removeMember(projectId: number, userId: number) {
    const member = await this.projectMemberRepository.findOne({
      where: { projectId, userId },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    await this.projectMemberRepository.remove(member);
  }
}

