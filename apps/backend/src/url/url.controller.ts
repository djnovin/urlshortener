import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Redirect,
  Req,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { Request } from 'express';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  async createUrl(@Body('originalUrl') originalUrl: string) {
    const shortId = await this.urlService.createShortUrl({ originalUrl });
    return { shortUrl: `http://localhost:8000/${shortId.shortUrl}` };
  }

  @Get(':shortUrl')
  @Redirect()
  async redirectUrl(@Param('shortUrl') shortUrl: string, @Req() req: Request) {
    const url = await this.urlService.getOriginalUrl(shortUrl, req);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return { url };
  }

  @Get()
  async getAllUrls() {
    return this.urlService.getAllUrls();
  }
}
