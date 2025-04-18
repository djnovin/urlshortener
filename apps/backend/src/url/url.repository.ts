import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from '../shared/bsae.repository';
import { Url, Prisma, Click } from '@prisma/client';

@Injectable()
export class UrlRepository extends BaseRepository<
  Url,
  Prisma.UrlCreateInput,
  Prisma.UrlUpdateInput
> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, 'url');
  }

  findByShortUrl(shortUrl: string): Promise<Url | null> {
    return this.prismaService.url.findFirst({ where: { shortUrl } });
  }

  incrementClicks(id: string): Promise<Url> {
    return this.prismaService.url.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
  }

  createClick(data: Prisma.ClickCreateInput): Promise<Click> {
    return this.prismaService.click.create({ data });
  }

  getAllShortUrls(): Promise<Pick<Url, 'shortUrl'>[]> {
    return this.prismaService.url.findMany({
      select: { shortUrl: true },
    });
  }
}
