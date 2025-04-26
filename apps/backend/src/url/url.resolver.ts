import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UrlService } from './url.service';
import { NotFoundException } from '@nestjs/common';
import { Request } from 'express';

@Resolver()
export class UrlResolver {
  constructor(private readonly urlService: UrlService) {}

  @Mutation(() => String)
  async createShortUrl(@Args('originalUrl') originalUrl: string) {
    const { shortUrl } = await this.urlService.createShortUrl({ originalUrl });
    return shortUrl;
  }

  @Query(() => String)
  async getOriginalUrl(
    @Args('shortUrl') shortUrl: string,
    @Context() context: { req: Request },
  ) {
    const originalUrl = await this.urlService.getOriginalUrl(
      shortUrl,
      context.req,
    );
    if (!originalUrl) {
      throw new NotFoundException('Short URL not found or expired');
    }
    return originalUrl;
  }
}
