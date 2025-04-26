import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUrlDto, UpdateUrlDto } from './url.dto';
import { UrlRepository } from './url.repository';

@Injectable()
export class UrlService {
  constructor(
    private readonly urlRepo: UrlRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createShortUrl(
    dto: CreateUrlDto,
    userId?: string,
  ): Promise<{ shortUrl: string; domain?: string }> {
    const { originalUrl, expiredAt, utm } = dto;

    const shortUrl = Math.random().toString(36).substring(2, 7);

    let userDomain: string | undefined = undefined;

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { customDomain: true },
      });

      if (user?.customDomain) {
        userDomain = user.customDomain;
      }
    }

    const url = await this.urlRepo.create({
      clicks: 0,
      originalUrl,
      shortUrl,
      expiredAt: expiredAt ?? new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      domain: userDomain,
      utm: utm
        ? {
            create: {
              campaign: utm.campaign,
              content: utm.content,
              medium: utm.medium,
              ref: utm.ref,
              source: utm.source,
              term: utm.term,
            },
          }
        : undefined,
      ...(userId && { createdBy: { connect: { id: userId } } }),
    });

    return { shortUrl: url.shortUrl, domain: userDomain };
  }

  async getOriginalUrl(shortUrl: string, req: Request): Promise<string | null> {
    const url = await this.urlRepo.findByShortUrl(shortUrl);
    if (!url || (url.expiredAt && url.expiredAt < new Date())) return null;

    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress;

    const userAgent = req.headers['user-agent'];

    await this.urlRepo.createClick({
      url: { connect: { id: url.id } },
      ip,
      userAgent,
    });

    await this.urlRepo.incrementClicks(url.id);

    return url.originalUrl;
  }

  async updateUrl(id: string, dto: UpdateUrlDto) {
    const existing = await this.urlRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('URL not found');
    }

    return this.urlRepo.update(id, {
      expiredAt: dto.expiredAt,
      utm: dto.utm
        ? {
            update: {
              campaign: dto.utm.campaign,
              content: dto.utm.content,
              medium: dto.utm.medium,
              ref: dto.utm.ref,
              source: dto.utm.source,
              term: dto.utm.term,
            },
          }
        : undefined,
    });
  }
}
