import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AddressModule } from './address/address.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { TerminusModule } from '@nestjs/terminus';
import { MetricsModule } from './metrics/metrics.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payment/payment.module';
import { BaseModule } from './common/base.module';
import { CartsModule } from './carts/carts.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from './backup/backup.service';
import { BackupModule } from './backup/backup.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { ConfigModule as AppConfigModule } from './config/config.module';
import {
  I18nModule,
  QueryResolver,
  HeaderResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { HttpModule } from '@nestjs/axios';
import { AiChatboxModule } from './ai-chatbox/ai-chatbox.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 20,
        },
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      autoLoadEntities: true,
      synchronize: false,
    }),
    ScheduleModule.forRoot(),
    BaseModule,
    TerminusModule,
    ProductsModule,
    AuthModule,
    UsersModule,
    AddressModule,
    HealthModule,
    MetricsModule,
    CategoriesModule,
    OrdersModule,
    PaymentModule,
    CartsModule,
    WishlistModule,
    AiChatboxModule,
    AdminDashboardModule,
    BackupModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    AppConfigModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      logging: true,
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        new HeaderResolver(['x-lang']),
        AcceptLanguageResolver,
      ],
    }),
    HttpModule.register({}),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
        auth: {
          user: process.env.SMTP_USER || 'test@example.com',
          pass: process.env.SMTP_PASS || 'password',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    BackupService,
  ],
})
export class AppModule {}
