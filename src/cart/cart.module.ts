import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Cart, CartSchema } from './schemas/cart.schema.js';
import { CartRepository } from './repositories/cart.repository.js';
import { CartService } from './cart.service.js';
import { CartController } from './cart.controller.js';
import { ProductsModule } from '../products/products.module.js';
import { InventoryModule } from '../inventory/inventory.module.js';
import { UsersModule } from '../users/users.module.js';
import { CouponsModule } from '../coupons/coupons.module.js';
import { ShippingModule } from '../shipping/shipping.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    ProductsModule,
    InventoryModule,
    UsersModule,
    CouponsModule,
    ShippingModule,
  ],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService, CartRepository],
})
export class CartModule {}
