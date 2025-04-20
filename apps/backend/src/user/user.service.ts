import { Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import { CreateUserDto, UpdateProfileDto } from './user.dto';

@Injectable()
export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createUser(dto: CreateUserDto) {
    const { email, password, name, avatarUrl, bio } = dto;

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 5,
      parallelism: 1,
    });

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            name,
            avatarUrl,
            bio,
          },
        },
      },
      include: {
        profile: true,
      },
    });
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('User or profile not found');
    }

    return this.prisma.profile.update({
      where: { userId },
      data: dto,
    });
  }
}
