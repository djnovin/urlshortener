import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UrlService } from './url.service';
import { NotFoundException } from '@nestjs/common';

@Resolver()
export class UrlResolver {
  constructor(private readonly urlService: UrlService) {}

  @Mutation(() => String)
  async createShortUrl(@Args('originalUrl') originalUrl: string) {
    const { shortUrl } = await this.urlService.createShortUrl(originalUrl);
    return shortUrl;
  }

  @Query(() => String)
  async getOriginalUrl(@Args('shortUrl') shortUrl: string) {
    const originalUrl = await this.urlService.getOriginalUrl(shortUrl);
    if (!originalUrl) {
      throw new NotFoundException('Short URL not found');
    }
    return originalUrl;
  }
}
