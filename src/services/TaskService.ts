import { AppDataSource } from '../config/database';
import { Task } from '../entities/Task';
import { CreateTaskDto, UpdateTaskDto } from '../types';

export class TaskService {
  private taskRepository = AppDataSource.getRepository(Task);

  async findAll(filters?: {
    projectId?: number;
    assigneeId?: number;
    status?: string;
    priority?: string;
  }) {
    const where: any = {};
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;

    return this.taskRepository.find({
      where,
      relations: ['project', 'assignee', 'sprint'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number) {
    return this.taskRepository.findOne({
      where: { id },
      relations: ['project', 'assignee', 'sprint'],
    });
  }

  async create(data: CreateTaskDto) {
    const task = this.taskRepository.create({
      name: data.name,
      description: data.description || null,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: data.projectId || null,
      assigneeId: data.assigneeId || null,
      sprintId: data.sprintId || null,
      comments: data.comments || 0,
      attachments: data.attachments || 0,
    });

    return this.taskRepository.save(task);
  }

  async update(id: number, data: UpdateTaskDto) {
    const task = await this.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    Object.assign(task, {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.priority && { priority: data.priority }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.projectId !== undefined && { projectId: data.projectId }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.sprintId !== undefined && { sprintId: data.sprintId }),
      ...(data.comments !== undefined && { comments: data.comments }),
      ...(data.attachments !== undefined && { attachments: data.attachments }),
    });

    return this.taskRepository.save(task);
  }

  async delete(id: number) {
    const task = await this.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    await this.taskRepository.remove(task);
  }
}

