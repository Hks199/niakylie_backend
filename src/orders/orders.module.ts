import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { CheckoutModule } from '../checkout/checkout.module.js';
import { ProductsModule } from '../products/products.module.js';
import { InventoryModule } from '../inventory/inventory.module.js';

@Module({
  imports: [CheckoutModule, ProductsModule, InventoryModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
