import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Order, OrderSchema } from '../checkout/schemas/order.schema.js';
import { Product, ProductSchema } from '../products/schemas/product.schema.js';
import { Inventory, InventorySchema } from '../inventory/schemas/inventory.schema.js';
import { User, UserSchema } from '../users/schemas/user.schema.js';

import { DashboardService } from './dashboard.service.js';
import { DashboardController } from './dashboard.controller.js';
import { RedisCacheModule } from '../cache/cache.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Inventory.name, schema: InventorySchema },
      { name: User.name, schema: UserSchema },
    ]),
    RedisCacheModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
