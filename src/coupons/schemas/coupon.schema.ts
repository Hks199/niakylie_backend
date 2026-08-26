import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

export enum CouponType {
  FLAT = 'FLAT',
  PERCENTAGE = 'PERCENTAGE',
}

export enum CouponApplicability {
  ALL = 'ALL',
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  CUSTOMER = 'CUSTOMER',
}

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  code!: string;

  @Prop({ trim: true })
  title?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, enum: CouponType })
  type!: CouponType;

  @Prop({ required: true, min: 0 })
  value!: number;

  @Prop({ required: true, enum: CouponApplicability, default: CouponApplicability.ALL })
  applicability!: CouponApplicability;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Product' }], default: [] })
  applicableProductIds!: Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Category' }], default: [] })
  applicableCategoryIds!: Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  applicableCustomerIds!: Types.ObjectId[];

  @Prop({ default: 0, min: 0 })
  minOrderAmount!: number;

  @Prop({ type: Number, default: null, min: 0 })
  maxDiscount!: number | null;

  @Prop({ type: Number, default: null, min: 1 })
  usageLimit!: number | null;

  @Prop({ default: 0, min: 0 })
  usedCount!: number;

  @Prop({ default: 1, min: 1 })
  userLimit!: number;

  @Prop({ required: true, type: Date })
  startDate!: Date;

  @Prop({ required: true, type: Date })
  endDate!: Date;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, isDeleted: 1, startDate: 1, endDate: 1 });
