import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { UserUpdateDto } from './dto/user-update.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly clsService: ClsService,
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
    const user = await this.usersRepository.findOne({
      where: { email },
      select: [
        'password',
        'email',
        'id',
        'first_name',
        'last_name',
        'createdAt',
        'updatedAt',
        'version',
        'deletedDate',
        'roles',
        'transactions',
      ],
    });
    if (!user) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    return user;
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

  async findBySession(): Promise<User> {
    return this.usersRepository.findOne({
      where: { id: this.clsService.get<User>('user').id },
    });
  }

  async updateUser(id: number, userUpdateDto: UserUpdateDto) {
    const user = await this.usersRepository.findOneOrFail({ where: { id } });
    if (userUpdateDto.password) {
      user.password = await bcrypt.hash(userUpdateDto.password, 10);
    }
    if (userUpdateDto.first_name) {
      user.first_name = userUpdateDto.first_name;
    }
    if (userUpdateDto.last_name) {
      user.last_name = userUpdateDto.last_name;
    }
    if (userUpdateDto.email) {
      user.email = userUpdateDto.email;
    }
    return this.usersRepository.save(user);
  }
}
