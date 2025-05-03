import { Controller, Post, Req, Res, Headers, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeWebhookService } from './stripe.service';

@Controller('webhook/stripe')
export class StripeWebhookController {
  constructor(private stripeWebhookService: StripeWebhookService) {}

  @Post()
  @HttpCode(200)
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.stripeWebhookService.handleStripeWebhook(req, res, signature);
  }
}
