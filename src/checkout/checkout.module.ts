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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CartModule,
    InventoryModule,
    ProductsModule,
    UsersModule,
    CouponsModule,
    NotificationsModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService, OrdersRepository],
  exports: [CheckoutService, OrdersRepository],
})
export class CheckoutModule {}
