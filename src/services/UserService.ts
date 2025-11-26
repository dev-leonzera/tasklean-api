import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { CreateUserDto, UpdateUserDto } from '../types';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async findAll() {
    return this.userRepository.find({
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });
  }

  async findById(id: number) {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async create(data: CreateUserDto) {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const user = this.userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password, // Em produção, deve ser hash
    });

    const savedUser = await this.userRepository.save(user);
    return this.findById(savedUser.id);
  }

  async update(id: number, data: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    Object.assign(user, {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.password && { password: data.password }), // Em produção, deve ser hash
    });

    const updatedUser = await this.userRepository.save(user);
    return this.findById(updatedUser.id);
  }

  async delete(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.remove(user);
  }
}

