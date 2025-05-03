import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Stripe } from 'stripe';
import { CreateCheckoutSessionDto } from './payment.dto';
import { ZodValidationPipe } from '../shared/zod.pipe';
import { CreateCheckoutSession } from './payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body(new ZodValidationPipe(CreateCheckoutSession))
    body: CreateCheckoutSessionDto,
  ): Promise<Stripe.Checkout.Session> {
    return this.paymentService.createCheckoutSession(body);
  }
}
