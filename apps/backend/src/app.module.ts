import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UrlModule } from './url/url.module';
import { GraphQLModule } from '@nestjs/graphql';
import { Request } from 'express';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaymentModule } from './payment/payment.module';
import { WebhookModule } from './webhook/webhook.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { McpModule } from './mcp/mcp.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    AuthModule,
    UrlModule,
    ProfileModule,
    PaymentModule,
    WebhookModule,
    EmailModule,
    McpModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}
