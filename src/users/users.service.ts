import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailAndPassword(email: string, password: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { email, password } });
  }

  async create(user: User): Promise<User> {
    return await this.usersRepository.save(user);
  }

  async update(id: number, user: User): Promise<User> {
    await this.usersRepository.update(id, user);
    return await this.usersRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.usersRepository.delete(id);
  }
}
