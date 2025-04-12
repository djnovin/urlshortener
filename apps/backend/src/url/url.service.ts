import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UrlService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createShortUrl(originalUrl: string) {
    const shortUrl = Math.random().toString(36).substring(2, 7); // Generate a random 5-character string

    const result = await this.prisma.url.create({
      data: {
        originalUrl,
        shortUrl,
        clicks: 0,
      },
    });

    return { shortUrl: result.shortUrl };
  }

  async getOriginalUrl(shortUrl: string): Promise<string | null> {
    const url = await this.prisma.url.findFirst({
      where: { shortUrl },
    });

    if (!url) {
      throw new NotFoundException('URL not found');
    }

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
