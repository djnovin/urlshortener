import { Module } from '@nestjs/common';
import { UrlResolver } from './url.resolver';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';

@Module({
  controllers: [UrlController],
  providers: [UrlResolver, UrlService],
})
export class UrlModule {}
