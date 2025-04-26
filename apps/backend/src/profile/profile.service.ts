import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Profile } from '@prisma/client';
import { UpdateProfileDto } from './profile.dto';

@Injectable()
export class ProfileService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getProfile(userId: string): Promise<Profile> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<Profile> {
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
