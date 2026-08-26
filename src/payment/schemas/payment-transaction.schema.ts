import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type PaymentTransactionDocument = PaymentTransaction & Document;

export enum PaymentProvider {
  RAZORPAY = 'RAZORPAY',
  STRIPE = 'STRIPE',
  COD = 'COD',
  WALLET = 'WALLET',
}

export enum TransactionStatus {
  INITIATED = 'INITIATED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
}

@Schema({ _id: false, timestamps: true })
export class RefundRecord {
  @Prop({ required: true, trim: true })
  refundId!: string;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true, trim: true, default: 'SUCCESS' })
  status!: string;

  @Prop({ trim: true })
  reason?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}
export const RefundRecordSchema = SchemaFactory.createForClass(RefundRecord);

@Schema({ timestamps: true })
export class PaymentTransaction {
  @Prop({ required: true, unique: true, index: true, trim: true })
  transactionId!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId!: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  orderNumber!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true, sparse: true })
  userId?: Types.ObjectId;

  @Prop({ trim: true, index: true, sparse: true })
  guestId?: string;

  @Prop({ required: true, enum: PaymentProvider, index: true })
  provider!: PaymentProvider;

  @Prop({ trim: true, index: true })
  providerOrderId?: string;

  @Prop({ trim: true, index: true })
  providerPaymentId?: string;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true, default: 'INR', trim: true })
  currency!: string;

  @Prop({ required: true, enum: PaymentType, default: PaymentType.FULL })
  paymentType!: PaymentType;

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.INITIATED, index: true })
  status!: TransactionStatus;

  @Prop({ trim: true })
  signature?: string;

  @Prop({ type: [RefundRecordSchema], default: [] })
  refunds!: RefundRecord[];

  @Prop({ default: 0, min: 0 })
  totalRefundedAmount!: number;

  @Prop({ trim: true })
  failureReason?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const PaymentTransactionSchema = SchemaFactory.createForClass(PaymentTransaction);

PaymentTransactionSchema.index({ transactionId: 1 });
PaymentTransactionSchema.index({ orderId: 1, createdAt: -1 });
PaymentTransactionSchema.index({ providerOrderId: 1 });
PaymentTransactionSchema.index({ providerPaymentId: 1 });
