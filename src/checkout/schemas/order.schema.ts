import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum PaymentMethod {
  COD = 'COD',
  RAZORPAY = 'RAZORPAY',
  STRIPE = 'STRIPE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ShippingMethod {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  REFUNDED = 'REFUNDED',
}

@Schema({ _id: false })
export class OrderAddress {
  @Prop({ required: true, trim: true })
  street!: string;

  @Prop({ required: true, trim: true })
  city!: string;

  @Prop({ required: true, trim: true })
  state!: string;

  @Prop({ required: true, trim: true })
  postalCode!: string;

  @Prop({ required: true, trim: true })
  country!: string;

  @Prop({ required: true, trim: true })
  phone!: string;
}
export const OrderAddressSchema = SchemaFactory.createForClass(OrderAddress);

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  variantId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  sku!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, min: 1 })
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

  @Prop({ required: true, min: 0 })
  totalPrice!: number;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class PaymentInfo {
  @Prop({ required: true, enum: PaymentMethod, default: PaymentMethod.COD })
  method!: PaymentMethod;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Prop({ trim: true })
  transactionId?: string;

  @Prop({ type: Date })
  paidAt?: Date;
}
export const PaymentInfoSchema = SchemaFactory.createForClass(PaymentInfo);

@Schema({ _id: false })
export class ShippingInfo {
  @Prop({ required: true, enum: ShippingMethod, default: ShippingMethod.STANDARD })
  method!: ShippingMethod;

  @Prop({ required: true, min: 0, default: 0 })
  fee!: number;

  @Prop({ trim: true })
  trackingNumber?: string;

  @Prop({ trim: true })
  courierPartner?: string;

  @Prop({ type: Date })
  estimatedDelivery?: Date;

  @Prop({ type: Date })
  shippedAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;
}
export const ShippingInfoSchema = SchemaFactory.createForClass(ShippingInfo);

@Schema({ _id: false })
export class OrderPricing {
  @Prop({ required: true, min: 0 })
  subtotal!: number;

  @Prop({ required: true, min: 0 })
  totalMrp!: number;

  @Prop({ required: true, min: 0 })
  totalDiscount!: number;

  @Prop({ trim: true })
  couponCode?: string;

  @Prop({ default: 0, min: 0 })
  couponDiscount!: number;

  @Prop({ default: 0, min: 0 })
  onlinePaymentDiscount!: number;

  @Prop({ required: true, min: 0 })
  tax!: number;

  @Prop({ required: true, min: 0 })
  shippingFee!: number;

  @Prop({ required: true, min: 0 })
  grandTotal!: number;
}
export const OrderPricingSchema = SchemaFactory.createForClass(OrderPricing);

@Schema({ _id: false })
export class OrderTimeline {
  @Prop({ required: true, enum: OrderStatus })
  status!: OrderStatus;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ type: Date, default: Date.now })
  timestamp!: Date;

  @Prop({ trim: true })
  notes?: string;
}
export const OrderTimelineSchema = SchemaFactory.createForClass(OrderTimeline);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, index: true, trim: true })
  orderNumber!: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  invoiceNumber!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true, sparse: true })
  userId?: Types.ObjectId;

  @Prop({ trim: true, index: true, sparse: true })
  guestId?: string;

  @Prop({
    type: {
      email: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true },
    },
    _id: false,
  })
  customerInfo!: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };

  @Prop({ type: OrderAddressSchema, required: true })
  shippingAddress!: OrderAddress;

  @Prop({ type: OrderAddressSchema, required: true })
  billingAddress!: OrderAddress;

  @Prop({ type: [OrderItemSchema], default: [] })
  items!: OrderItem[];

  @Prop({ type: PaymentInfoSchema, required: true })
  paymentInfo!: PaymentInfo;

  @Prop({ type: ShippingInfoSchema, required: true })
  shippingInfo!: ShippingInfo;

  @Prop({ type: OrderPricingSchema, required: true })
  pricing!: OrderPricing;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.CONFIRMED, index: true })
  orderStatus!: OrderStatus;

  @Prop({ type: [OrderTimelineSchema], default: [] })
  timeline!: OrderTimeline[];

  @Prop({
    type: {
      reason: { type: String, trim: true },
      requestedAt: { type: Date },
      approvedAt: { type: Date },
      notes: { type: String, trim: true },
    },
    _id: false,
  })
  returnInfo?: {
    reason?: string;
    requestedAt?: Date;
    approvedAt?: Date;
    notes?: string;
  };

  @Prop({ type: String, trim: true })
  cancellationReason?: string;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ invoiceNumber: 1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ guestId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ 'customerInfo.email': 1 });
OrderSchema.index({ isDeleted: 1, orderStatus: 1 });
