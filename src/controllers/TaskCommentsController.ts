import { Request, Response, NextFunction } from 'express';
import { TaskCommentService } from '../services/TaskCommentService';
import { CreateTaskCommentDto, UpdateTaskCommentDto } from '../types';

const taskCommentService = new TaskCommentService();

export class TaskCommentsController {
  async getByTaskId(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const comments = await taskCommentService.findByTaskId(parseInt(taskId));

      // Transformar para o formato esperado pelo frontend
      const formattedComments = comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author?.name || '',
        authorId: comment.authorId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      }));

      res.json(formattedComments);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;
      const data: CreateTaskCommentDto = {
        ...req.body,
        taskId: parseInt(taskId),
      };

      if (!data.content || !data.authorId) {
        return res.status(400).json({ error: 'Content and authorId are required' });
      }

      const comment = await taskCommentService.create(data);

      res.status(201).json({
        id: comment?.id,
        content: comment?.content,
        author: comment?.author?.name || '',
        authorId: comment?.authorId,
        createdAt: comment?.createdAt,
        updatedAt: comment?.updatedAt,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Task not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const data: UpdateTaskCommentDto = req.body;

      const comment = await taskCommentService.update(parseInt(commentId), data);

      res.json({
        id: comment.id,
        content: comment.content,
        author: comment.author?.name || '',
        authorId: comment.authorId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Comment not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      await taskCommentService.delete(parseInt(commentId));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Comment not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
}

