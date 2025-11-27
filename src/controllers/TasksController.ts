import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/TaskService';
import { CreateTaskDto, UpdateTaskDto } from '../types';

const taskService = new TaskService();

export class TasksController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, assigneeId, status, priority } = req.query;

      const filters: any = {};
      if (projectId) filters.projectId = parseInt(projectId as string);
      if (assigneeId) filters.assigneeId = parseInt(assigneeId as string);
      if (status) filters.status = status;
      if (priority) filters.priority = priority;

      const tasks = await taskService.findAll(filters);

      // Transformar para o formato esperado pelo frontend
      const formattedTasks = tasks.map(task => ({
        id: task.id,
        name: task.name,
        project: task.project?.name || '',
        assignee: task.assignee?.name || '',
        assigneeId: task.assigneeId,
        status: task.status,
        priority: task.priority,
        due: task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : '',
        comments: task.comments,
        attachments: task.attachments,
        description: task.description,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }));

      res.json(formattedTasks);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await taskService.findById(parseInt(id));

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateTaskDto = req.body;

      if (!data.name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const task = await taskService.create(data);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateTaskDto = req.body;

      const task = await taskService.update(parseInt(id), data);
      res.json(task);
    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await taskService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
}

