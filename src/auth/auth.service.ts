import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AccessToken } from './auth.type';
import { RegisterRequestDto } from './dto/register-request.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user: User = await this.usersService.findByEmailAndPassword(
      email,
      password,
    );
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async login(user: User): Promise<AccessToken> {
    const payload = { email: user.email, id: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(user: RegisterRequestDto): Promise<AccessToken> {
    const existingUser = await this.usersService.findByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('email already exists');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser: User = new User();
    newUser.email = user.email;
    newUser.password = hashedPassword;
    newUser.first_name = user.first_name;
    newUser.last_name = user.last_name;

    await this.usersService.create(newUser);
    return this.login(newUser);
  }
}
