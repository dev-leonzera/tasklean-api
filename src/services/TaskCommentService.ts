import { AppDataSource } from '../config/database';
import { TaskComment } from '../entities/TaskComment';
import { Task } from '../entities/Task';
import { CreateTaskCommentDto, UpdateTaskCommentDto } from '../types';

export class TaskCommentService {
  private commentRepository = AppDataSource.getRepository(TaskComment);
  private taskRepository = AppDataSource.getRepository(Task);

  async findByTaskId(taskId: number) {
    return this.commentRepository.find({
      where: { taskId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number) {
    return this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async create(data: CreateTaskCommentDto) {
    const task = await this.taskRepository.findOne({ where: { id: data.taskId } });
    if (!task) {
      throw new Error('Task not found');
    }

    const comment = this.commentRepository.create({
      content: data.content,
      taskId: data.taskId,
      authorId: data.authorId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Atualizar contagem de comentários na tarefa
    await this.updateTaskCommentCount(data.taskId);

    return this.findById(savedComment.id);
  }

  async update(id: number, data: UpdateTaskCommentDto) {
    const comment = await this.findById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }

    Object.assign(comment, {
      ...(data.content && { content: data.content }),
    });

    return this.commentRepository.save(comment);
  }

  async delete(id: number) {
    const comment = await this.findById(id);
    if (!comment) {
      throw new Error('Comment not found');
    }

    const taskId = comment.taskId;
    await this.commentRepository.remove(comment);

    // Atualizar contagem de comentários na tarefa
    await this.updateTaskCommentCount(taskId);
  }

  private async updateTaskCommentCount(taskId: number) {
    const count = await this.commentRepository.count({ where: { taskId } });
    await this.taskRepository.update(taskId, { comments: count });
  }
}

