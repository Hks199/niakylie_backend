import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Order, OrderSchema } from './schemas/order.schema.js';
import { OrdersRepository } from './repositories/orders.repository.js';
import { CheckoutService } from './checkout.service.js';
import { CheckoutController } from './checkout.controller.js';

import { CartModule } from '../cart/cart.module.js';
import { InventoryModule } from '../inventory/inventory.module.js';
import { ProductsModule } from '../products/products.module.js';
import { UsersModule } from '../users/users.module.js';
import { CouponsModule } from '../coupons/coupons.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { OnlinePaymentDiscount, OnlinePaymentDiscountSchema } from '../payment/schemas/online-payment-discount.schema.js';
import { OnlinePaymentDiscountRepository } from '../payment/repositories/online-payment-discount.repository.js';
import { OnlinePaymentDiscountService } from '../payment/online-payment-discount.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OnlinePaymentDiscount.name, schema: OnlinePaymentDiscountSchema },
    ]),
    CartModule,
    InventoryModule,
    ProductsModule,
    UsersModule,
    CouponsModule,
    NotificationsModule,
  ],
  controllers: [CheckoutController],
  providers: [
    CheckoutService,
    OrdersRepository,
    OnlinePaymentDiscountService,
    OnlinePaymentDiscountRepository,
  ],
  exports: [CheckoutService, OrdersRepository, OnlinePaymentDiscountService],
})
export class CheckoutModule {}
