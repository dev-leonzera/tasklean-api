import { Request, Response, NextFunction } from 'express';
import { CommitmentService } from '../services/CommitmentService';
import { CreateCommitmentDto, UpdateCommitmentDto } from '../types';

const commitmentService = new CommitmentService();

export class CommitmentsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, status, priority, date } = req.query;

      const filters: any = {};
      if (projectId) filters.projectId = parseInt(projectId as string);
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (date) filters.date = date as string;

      const commitments = await commitmentService.findAll(filters);

      // Transformar para o formato esperado pelo frontend
      const formattedCommitments = commitments.map(commitment => ({
        id: commitment.id,
        title: commitment.title,
        description: commitment.description,
        date: new Date(commitment.date).toISOString().split('T')[0], // YYYY-MM-DD
        startTime: commitment.startTime,
        endTime: commitment.endTime,
        location: commitment.location,
        participants: commitment.participants?.map(p => p.user.name) || [],
        project: commitment.project?.name,
        status: commitment.status,
        priority: commitment.priority,
        reminder: commitment.reminder,
      }));

      res.json(formattedCommitments);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const commitment = await commitmentService.findById(parseInt(id));

      if (!commitment) {
        return res.status(404).json({ error: 'Commitment not found' });
      }

      res.json(commitment);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateCommitmentDto = req.body;

      if (!data.title || !data.date || !data.startTime || !data.endTime) {
        return res.status(400).json({ error: 'Title, date, startTime, and endTime are required' });
      }

      const commitment = await commitmentService.create(data);
      res.status(201).json(commitment);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateCommitmentDto = req.body;

      const commitment = await commitmentService.update(parseInt(id), data);
      res.json(commitment);
    } catch (error) {
      if (error instanceof Error && error.message === 'Commitment not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await commitmentService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Commitment not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  async addParticipant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const participant = await commitmentService.addParticipant(parseInt(id), parseInt(userId));
      res.status(201).json(participant);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User is already a participant of this commitment') {
          return res.status(409).json({ error: error.message });
        }
      }
      next(error);
    }
  }

  async removeParticipant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, userId } = req.params;
      await commitmentService.removeParticipant(parseInt(id), parseInt(userId));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Participant not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
}

