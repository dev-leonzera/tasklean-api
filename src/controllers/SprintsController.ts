import { Request, Response, NextFunction } from 'express';
import { SprintService } from '../services/SprintService';
import { CreateSprintDto, UpdateSprintDto } from '../types';

const sprintService = new SprintService();

export class SprintsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, status } = req.query;

      const filters: any = {};
      if (projectId) filters.projectId = parseInt(projectId as string);
      if (status) filters.status = status;

      const sprints = await sprintService.findAll(filters);

      // Transformar para o formato esperado pelo frontend
      const formattedSprints = sprints.map(sprint => {
        const completedTasks = sprint.tasks?.filter(t => t.status === 'done').length || 0;
        const totalTasks = sprint.tasks?.length || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          id: sprint.id,
          name: sprint.name,
          status: sprint.status,
          startDate: new Date(sprint.startDate).toLocaleDateString('pt-BR'),
          endDate: new Date(sprint.endDate).toLocaleDateString('pt-BR'),
          progress,
          tasks: {
            total: totalTasks,
            completed: completedTasks,
          },
          team: sprint.members?.map(m => m.user.name) || [],
        };
      });

      res.json(formattedSprints);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sprint = await sprintService.findById(parseInt(id));

      if (!sprint) {
        return res.status(404).json({ error: 'Sprint not found' });
      }

      res.json(sprint);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateSprintDto = req.body;

      if (!data.name || !data.startDate || !data.endDate || !data.projectId) {
        return res.status(400).json({ error: 'Name, startDate, endDate, and projectId are required' });
      }

      const sprint = await sprintService.create(data);
      res.status(201).json(sprint);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateSprintDto = req.body;

      const sprint = await sprintService.update(parseInt(id), data);
      res.json(sprint);
    } catch (error) {
      if (error instanceof Error && error.message === 'Sprint not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await sprintService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Sprint not found') {
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

      const member = await sprintService.addMember(parseInt(id), parseInt(userId));
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User is already a member of this sprint') {
          return res.status(409).json({ error: error.message });
        }
      }
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, userId } = req.params;
      await sprintService.removeMember(parseInt(id), parseInt(userId));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Member not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
}

