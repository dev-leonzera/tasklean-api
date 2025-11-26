import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserDto, UpdateUserDto } from '../types';

const userService = new UserService();

export class UsersController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.findById(parseInt(id));

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateUserDto = req.body;

      if (!data.name || !data.email || !data.password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const user = await userService.create(data);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data: UpdateUserDto = req.body;

      const user = await userService.update(parseInt(id), data);
      res.json(user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Email already exists') {
          return res.status(409).json({ error: error.message });
        }
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await userService.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }
}

