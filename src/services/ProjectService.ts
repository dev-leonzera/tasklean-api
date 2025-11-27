import { AppDataSource } from '../config/database';
import { Project } from '../entities/Project';
import { ProjectMember } from '../entities/ProjectMember';
import { ProjectTag } from '../entities/ProjectTag';
import { CreateProjectDto, UpdateProjectDto } from '../types';

export class ProjectService {
  private projectRepository = AppDataSource.getRepository(Project);
  private projectMemberRepository = AppDataSource.getRepository(ProjectMember);
  private projectTagRepository = AppDataSource.getRepository(ProjectTag);

  async findAll(filters?: { tag?: string }) {
    let query = this.projectRepository.createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.members', 'members')
      .leftJoinAndSelect('members.user', 'user')
      .leftJoinAndSelect('project.tasks', 'tasks')
      .leftJoinAndSelect('project.tags', 'tags');

    if (filters?.tag) {
      query = query.andWhere('tags.name = :tagName', { tagName: filters.tag });
    }

    return query.getMany();
  }

  async findById(id: number) {
    return this.projectRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user', 'tasks', 'sprints', 'commitments', 'tags'],
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

    if (data.tags && data.tags.length > 0) {
      const tags = data.tags.map(tag =>
        this.projectTagRepository.create({
          projectId: savedProject.id,
          name: tag.name,
          color: tag.color || '#3B82F6',
        })
      );
      await this.projectTagRepository.save(tags);
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

    await this.projectRepository.save(project);

    // Atualizar tags se fornecidas
    if (data.tags !== undefined) {
      // Remover tags existentes
      await this.projectTagRepository.delete({ projectId: id });

      // Adicionar novas tags
      if (data.tags.length > 0) {
        const tags = data.tags.map(tag =>
          this.projectTagRepository.create({
            projectId: id,
            name: tag.name,
            color: tag.color || '#3B82F6',
          })
        );
        await this.projectTagRepository.save(tags);
      }
    }

    return this.findById(id);
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

  async getAllTags() {
    return this.projectTagRepository
      .createQueryBuilder('tag')
      .select('DISTINCT tag.name', 'name')
      .addSelect('tag.color', 'color')
      .getRawMany();
  }
}

