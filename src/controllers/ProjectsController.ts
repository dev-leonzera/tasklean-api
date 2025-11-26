import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/ProjectService';
import { CreateProjectDto, UpdateProjectDto } from '../types';

const projectService = new ProjectService();

export class ProjectsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await projectService.findAll();

      // Transformar para o formato esperado pelo frontend
      const formattedProjects = projects.map(project => {
        const completedTasks = project.tasks?.filter(t => t.status === 'done').length || 0;
        const totalTasks = project.tasks?.length || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          id: project.id,
          name: project.name,
          desc: project.description,
          progress,
          tasks: totalTasks,
          completed: completedTasks,
          status: project.status,
          members: project.members?.map(m => m.user.name) || [],
          due: project.dueDate ? new Date(project.dueDate).toLocaleDateString('pt-BR') : '',
          color: project.color,
        };
      });

      res.json(formattedProjects);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const project = await projectService.findById(parseInt(id));

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateProjectDto = req.body;

      if (!data.name || !data.ownerId) {
        return res.status(400).json({ error: 'Name and ownerId are required' });
      }

      const project = await projectService.create(data);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateProjectDto = req.body;

      const project = await projectService.update(parseInt(id), data);
      res.json(project);
    } catch (error) {
      if (error instanceof Error && error.message === 'Project not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await projectService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Project not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const member = await projectService.addMember(parseInt(id), parseInt(userId));
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User is already a member of this project') {
          return res.status(409).json({ error: error.message });
        }
      }
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, userId } = req.params;
      await projectService.removeMember(parseInt(id), parseInt(userId));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Member not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
}

