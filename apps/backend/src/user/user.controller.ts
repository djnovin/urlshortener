import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { CreateUserDto, UpdateProfileDto } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Patch(':id/profile')
  async updateProfile(
    @Param('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }
}
