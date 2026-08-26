import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  variantId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  sku!: string;

  @Prop({ required: true, min: 1, default: 1 })
  quantity!: number;

  @Prop({ required: true, min: 0 })
  unitPrice!: number;

  @Prop({ required: true, min: 0 })
  unitMrp!: number;

  @Prop({ trim: true })
  color?: string;

  @Prop({ trim: true })
  size?: string;

  @Prop({ trim: true })
  image?: string;

  @Prop({ default: false })
  isSavedForLater!: boolean;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true, sparse: true })
  userId?: Types.ObjectId;

  @Prop({ trim: true, index: true, sparse: true })
  guestId?: string;

  @Prop({ type: [CartItemSchema], default: [] })
  items!: CartItem[];

  @Prop({ trim: true })
  couponCode?: string;

  @Prop({ default: 0, min: 0 })
  couponDiscount!: number;

  @Prop({ default: 0, min: 0 })
  subtotal!: number;

  @Prop({ default: 0, min: 0 })
  totalMrp!: number;

  @Prop({ default: 0, min: 0 })
  totalDiscount!: number;

  @Prop({ default: 0, min: 0 })
  tax!: number;

  @Prop({ default: 0, min: 0 })
  shippingFee!: number;

  @Prop({ default: 0, min: 0 })
  grandTotal!: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Indexes
CartSchema.index({ userId: 1 }, { unique: true, sparse: true });
CartSchema.index({ guestId: 1 }, { unique: true, sparse: true });
