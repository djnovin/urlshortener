import { Module } from '@nestjs/common';
import { StripeWebhookController } from './stripe/stripe.controller';
import { StripeWebhookService } from './stripe/stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

@Module({
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService, PrismaService, ConfigService, EmailService],
})
export class WebhookModule {}
