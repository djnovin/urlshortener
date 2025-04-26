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
  UseGuards,
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
import { JwtAuthGuard } from '../shared/jwt.guard';
import { CurrentUser } from '../auth/auth.decorator';
import { ConfigService } from '@nestjs/config';

@Controller()
export class UrlController {
  constructor(
    private readonly urlService: UrlService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createUrl(
    @CurrentUser() user: { sub: string } | null,
    @Body(new ZodValidationPipe(CreateUrlSchema)) dto: CreateUrlDto,
  ) {
    const userId = user?.sub;
    const result = await this.urlService.createShortUrl(dto, userId);

    const appBaseUrl =
      this.configService.get('APP_BASE_URL') || 'http://localhost:8000';
    const domain = result?.domain || new URL(appBaseUrl).hostname;

    return { url: `http://${domain}/${result.shortUrl}` };
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUrl(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUrlSchema)) body: UpdateUrlDto,
  ) {
    return this.urlService.updateUrl(id, body);
  }
}
