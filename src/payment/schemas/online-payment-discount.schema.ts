import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OnlinePaymentDiscountDocument = OnlinePaymentDiscount & Document;

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

@Schema({ timestamps: true })
export class OnlinePaymentDiscount {
  @Prop({ default: true })
  isEnabled!: boolean;

  @Prop({ type: String, enum: DiscountType, default: DiscountType.PERCENTAGE })
  discountType!: DiscountType;

  @Prop({ default: 5 })
  discountValue!: number; // 5 = 5% or flat ₹50

  @Prop({ default: 0 })
  minOrderAmount!: number;

  @Prop({ default: 500 })
  maxDiscountCap!: number;

  @Prop({ default: 'EXTRA 5% OFF ON ONLINE PAYMENTS' })
  badgeText!: string;

  @Prop({ default: 'Pay via UPI or Cards to get extra instant discount' })
  description!: string;
}

export const OnlinePaymentDiscountSchema = SchemaFactory.createForClass(OnlinePaymentDiscount);
