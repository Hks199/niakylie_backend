import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { CheckoutModule } from '../checkout/checkout.module.js';
import { ProductsModule } from '../products/products.module.js';
import { InventoryModule } from '../inventory/inventory.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { PaymentModule } from '../payment/payment.module.js';

@Module({
  imports: [
    CheckoutModule,
    ProductsModule,
    InventoryModule,
    NotificationsModule,
    forwardRef(() => PaymentModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
