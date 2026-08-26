import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Coupon, CouponSchema } from './schemas/coupon.schema.js';
import { CouponsRepository } from './repositories/coupons.repository.js';
import { CouponsService } from './coupons.service.js';
import { CouponsController } from './coupons.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
  ],
  controllers: [CouponsController],
  providers: [CouponsService, CouponsRepository],
  exports: [CouponsService, CouponsRepository],
})
export class CouponsModule {}
