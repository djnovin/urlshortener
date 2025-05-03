import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
  }

  async sendWelcomeEmail(to: string) {
    return this.resend.emails.send({
      from: 'noreply@yourdomain.com',
      to,
      subject: 'Welcome to Our Service!',
      html: `<h1>Welcome 🎉</h1><p>Thank you for signing up. Let's get started!</p>`,
    });
  }

  async sendSubscriptionConfirmedEmail(to: string) {
    return this.resend.emails.send({
      from: 'noreply@yourdomain.com',
      to,
      subject: 'Your Subscription is Confirmed!',
      html: `<h1>Subscription Activated</h1><p>You're all set. Thank you for subscribing 🙌</p>`,
    });
  }

  async sendTrialEndingSoonEmail(to: string) {
    return this.resend.emails.send({
      from: 'noreply@yourdomain.com',
      to,
      subject: 'Your Trial is Ending Soon!',
      html: `<p>Your free trial will end in 3 days. Upgrade now to keep enjoying our service!</p>`,
    });
  }

  async sendPaymentFailedEmail(to: string) {
    return this.resend.emails.send({
      from: 'noreply@yourdomain.com',
      to,
      subject: 'Payment Failed',
      html: `<p>We couldn't process your last payment. Please update your billing information.</p>`,
    });
  }
}
