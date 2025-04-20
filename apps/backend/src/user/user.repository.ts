import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../shared/bsae.repository';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'user');
  }
}
