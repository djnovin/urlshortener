import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { CreateUrlDto, UpdateUrlDto } from './url.dto';
import { UrlRepository } from './url.repository';

@Injectable()
export class UrlService {
  constructor(private readonly urlRepo: UrlRepository) {}

  async createShortUrl(dto: CreateUrlDto): Promise<{ shortUrl: string }> {
    const {
      originalUrl,
      expiredAt,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
    } = dto;

    const shortUrl = Math.random().toString(36).substring(2, 7);

    const result = await this.urlRepo.create({
      clicks: 0,
      originalUrl,
      shortUrl,
      expiredAt: expiredAt
        ? new Date(expiredAt)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      utm: {
        create: {
          source: utm_source,
          medium: utm_medium,
          campaign: utm_campaign,
          term: utm_term,
          content: utm_content,
        },
      },
    });

    return { shortUrl: result.shortUrl };
  }

  async getOriginalUrl(shortUrl: string, req: Request): Promise<string | null> {
    const url = await this.urlRepo.findByShortUrl(shortUrl);
    if (!url || (url.expiredAt && url.expiredAt < new Date())) return null;

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

    await this.urlRepo.createClick({
      url: { connect: { id: url.id } },
      ip,
      userAgent,
      country,
      city,
    });

    await this.urlRepo.incrementClicks(url.id);

    return url.originalUrl;
  }

  async updateUrl(id: string, dto: UpdateUrlDto) {
    const existing = await this.urlRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('URL not found');
    }

    const shouldUpdateUTM =
      dto.utm_source ||
      dto.utm_medium ||
      dto.utm_campaign ||
      dto.utm_term ||
      dto.utm_content;

    return this.urlRepo.update(id, {
      expiredAt: dto.expiredAt,
      utm: shouldUpdateUTM
        ? {
            update: {
              source: dto.utm_source,
              medium: dto.utm_medium,
              campaign: dto.utm_campaign,
              term: dto.utm_term,
              content: dto.utm_content,
            },
          }
        : undefined,
    });
  }

  async getAllUrls(): Promise<string[]> {
    const urls = await this.urlRepo.getAllShortUrls();
    return urls.map((url) => url.shortUrl);
  }
}
