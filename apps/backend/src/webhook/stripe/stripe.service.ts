import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../email/email.service';
import { Request, Response } from 'express';

@Injectable()
export class StripeWebhookService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET'),
      { apiVersion: '2025-03-31.basil' },
    );
  }

  async handleStripeWebhook(req: Request, res: Response, signature: string) {
    const endpointSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    let event: Stripe.Event;

    try {
      const rawBody = (req as any).rawBody ?? req.body;
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        endpointSecret,
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case 'customer.subscription.trial_will_end':
        await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
    }

    res.json({ received: true });
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string | undefined;
    const email = session.customer_details?.email || session.metadata?.email;

    if (!email) throw new InternalServerErrorException('Missing email.');

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new InternalServerErrorException('User not found.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
      },
    });

    await this.emailService.sendSubscriptionConfirmedEmail(user.email);
  }

  private async handleTrialWillEnd(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (user) {
      await this.emailService.sendTrialEndingSoonEmail(user.email);
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (user) {
      await this.emailService.sendPaymentFailedEmail(user.email);
    }
  }
}
