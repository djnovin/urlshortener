import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 5,
      parallelism: 1,
    });

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });

    return this.generateAndStoreTokens(user.id, user.email);
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    const isValid = user && (await argon2.verify(user.password, dto.password));
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAndStoreTokens(user.id, user.email);
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const isValid = await argon2.verify(user.refreshToken, token);
      if (!isValid) {
        throw new UnauthorizedException('Refresh token does not match');
      }

      return this.generateAccessToken(payload.sub, payload.email);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateAndStoreTokens(userId: string, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      { secret: process.env.JWT_SECRET, expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, email },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );

    const hashedRefreshToken = await argon2.hash(refreshToken);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });

    return { accessToken, refreshToken };
  }

  private generateAccessToken(userId: string, email: string) {
    return {
      accessToken: this.jwtService.sign(
        { sub: userId, email },
        { secret: process.env.JWT_SECRET, expiresIn: '15m' },
      ),
    };
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { success: true };
  }
}
