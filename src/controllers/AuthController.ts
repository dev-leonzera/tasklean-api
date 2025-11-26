import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserDto } from '../types';

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreateUserDto = req.body;

      if (!data.name || !data.email || !data.password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      if (data.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const user = await userService.create(data);
      
      // Em produção, retornar token JWT aqui
      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token: 'mock-token-' + user.id, // Mock token - em produção usar JWT
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await userService.findByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Em produção, usar bcrypt para comparar senhas
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Em produção, retornar token JWT aqui
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token: 'mock-token-' + user.id, // Mock token - em produção usar JWT
      });
    } catch (error) {
      next(error);
    }
  }
}

