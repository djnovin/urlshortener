import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class UrlService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createShortUrl({
    originalUrl,
    expiredAt,
  }: {
    originalUrl: string;
    expiredAt?: string;
  }): Promise<{ shortUrl: string }> {
    const shortUrl = Math.random().toString(36).substring(2, 7);

    const result = await this.prisma.url.create({
      data: {
        clicks: 0,
        originalUrl,
        shortUrl,
        expiredAt: expiredAt
          ? new Date(expiredAt)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { shortUrl: result.shortUrl };
  }

  async getOriginalUrl(shortUrl: string, req: Request): Promise<string | null> {
    const url = await this.prisma.url.findFirst({
      where: { shortUrl },
    });

    if (!url) return null;

    if (url.expiredAt && url.expiredAt < new Date()) {
      return null;
    }

    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress;

    const userAgent = req.headers['user-agent'] || null;

    let country: string | undefined;
    let city: string | undefined;

    const geo = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await geo.json();

    if (data.status === 'success') {
      country = data.country;
      city = data.city;
    }

    await this.prisma.click.create({
      data: {
        urlId: url.id,
        ip,
        userAgent,
        country,
        city,
      },
    });

    await this.prisma.url.update({
      where: { id: url.id },
      data: { clicks: { increment: 1 } },
    });

    return url.originalUrl;
  }

  async getAllUrls(): Promise<string[]> {
    const urls = await this.prisma.url.findMany({
      select: { shortUrl: true },
    });
    return urls.map((url: { shortUrl: string }) => url.shortUrl);
  }
}
