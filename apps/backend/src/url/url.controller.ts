import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Redirect,
  Req,
  Patch,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { Request } from 'express';
import {
  CreateUrlDto,
  CreateUrlSchema,
  UpdateUrlDto,
  UpdateUrlSchema,
} from './url.dto';
import { ZodValidationPipe } from '../shared/zod.pipe';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post()
  async createUrl(
    @Body(new ZodValidationPipe(CreateUrlSchema)) dto: CreateUrlDto,
  ) {
    const shortId = await this.urlService.createShortUrl(dto);
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

  @Patch(':id')
  async updateUrl(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUrlSchema)) body: UpdateUrlDto,
  ) {
    return this.urlService.updateUrl(id, body);
  }

  @Get()
  async getAllUrls() {
    return this.urlService.getAllUrls();
  }
}
