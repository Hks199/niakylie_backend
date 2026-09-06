import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { MongooseModule } from '@nestjs/mongoose';

import { AppConfigModule } from './config/index.js';
import { DatabaseModule } from './database/index.js';
import { RedisCacheModule } from './cache/index.js';
import { SharedModule, RequestLoggerMiddleware } from './shared/index.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { BrandsModule } from './brands/brands.module.js';
import { S3Module } from './s3/s3.module.js';
import { ProductsModule } from './products/products.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { SearchModule } from './search/search.module.js';
import { CartModule } from './cart/cart.module.js';
import { CouponsModule } from './coupons/coupons.module.js';
import { CheckoutModule } from './checkout/checkout.module.js';
import { PaymentModule } from './payment/payment.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { CmsModule } from './cms/cms.module.js';
import { BannersModule } from './banners/banners.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { AnnouncementsModule } from './announcements/announcements.module.js';
import { UploadsModule } from './uploads/uploads.module.js';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    RedisCacheModule,
    SharedModule,
    TerminusModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    BrandsModule,
    S3Module,
    UploadsModule,
    ProductsModule,
    InventoryModule,
    SearchModule,
    CartModule,
    CouponsModule,
    CheckoutModule,
    PaymentModule,
    OrdersModule,
    ReviewsModule,
    NotificationsModule,
    CmsModule,
    BannersModule,
    DashboardModule,
    AnnouncementsModule,
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('throttle.ttl') ?? 60000,
          limit: configService.get<number>('throttle.limit') ?? 300,
        },
      ],
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
