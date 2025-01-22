import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserUpdateDto } from './dto/user-update.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user')
  async getUser() {
    return await this.usersService.findBySession();
  }

  @Patch('user/:id')
  async updateUser(
    @Param('id') id: number,
    @Body() userUpdateDto: UserUpdateDto,
  ) {
    return await this.usersService.updateUser(id, userUpdateDto);
  }
}
