import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Redirect,
} from '@nestjs/common';
import { UrlService } from './url.service';

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
  async redirectUrl(@Param('shortUrl') shortUrl: string) {
    const originalUrl = await this.urlService.getOriginalUrl(shortUrl);
    if (!originalUrl) {
      throw new NotFoundException('URL not found');
    }
    return { url: originalUrl };
  }

  @Get()
  async getAllUrls() {
    return this.urlService.getAllUrls();
  }
}
