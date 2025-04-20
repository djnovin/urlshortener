import { Module } from '@nestjs/common';
import { UrlResolver } from './url.resolver';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { UrlRepository } from './url.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UrlController],
  providers: [UrlResolver, UrlService, UrlRepository],
})
export class UrlModule {}
