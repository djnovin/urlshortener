import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UrlModule } from './url/url.module';
import { GraphQLModule } from '@nestjs/graphql';
import { Request } from 'express';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    UrlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
