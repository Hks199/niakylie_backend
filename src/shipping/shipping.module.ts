import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShippingConfig, ShippingConfigSchema } from './schemas/shipping-config.schema.js';
import { ShippingController } from './shipping.controller.js';
import { ShippingService } from './shipping.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: ShippingConfig.name, schema: ShippingConfigSchema }])],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
