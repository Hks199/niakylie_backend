import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShippingConfigDocument = ShippingConfig & Document;

@Schema({ timestamps: true })
export class ShippingConfig {
  @Prop({ default: 99, min: 0 })
  standardDeliveryFee!: number;

  @Prop({ default: 149, min: 0 })
  expressDeliveryFee!: number;

  @Prop({ default: 1000, min: 0 })
  freeShippingThreshold!: number;
}

export const ShippingConfigSchema = SchemaFactory.createForClass(ShippingConfig);
