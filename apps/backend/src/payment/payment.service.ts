import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Stripe } from 'stripe';
import { ConfigService } from '@nestjs/config';
import {
  CreateCheckoutSessionDto,
  CreateSubscriptionSessionDto,
} from './payment.dto';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET'),
      {
        apiVersion: '2025-03-31.basil',
      },
    );
  }

  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: dto.currency,
              product_data: {
                name: dto.name,
              },
              unit_amount: Math.round(dto.amount * 100),
            },
            quantity: dto.quantity,
          },
        ],
        mode: 'payment',
        success_url: `${this.configService.getOrThrow<string>(
          'FRONTEND_URL',
        )}/success`,
        cancel_url: `${this.configService.getOrThrow<string>(
          'FRONTEND_URL',
        )}/cancel`,
        metadata: {
          productId: dto.productId,
        },
      });

      return session;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new InternalServerErrorException(
          `Stripe Error: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        'Unexpected error while creating checkout session.',
      );
    }
  }

  async createSubscriptionSession(
    dto: CreateSubscriptionSessionDto,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price: dto.priceId,
            quantity: dto.quantity,
          },
        ],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: 14,
        },
        success_url: `${this.configService.getOrThrow<string>(
          'FRONTEND_URL',
        )}/success`,
        cancel_url: `${this.configService.getOrThrow<string>(
          'FRONTEND_URL',
        )}/cancel`,
      });

      return session;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new InternalServerErrorException(
          `Stripe Error: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        'Unexpected error while creating subscription session.',
      );
    }
  }
}
