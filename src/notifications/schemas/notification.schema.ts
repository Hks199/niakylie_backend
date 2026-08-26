import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  OFFER = 'OFFER',
  COUPON = 'COUPON',
  SYSTEM = 'SYSTEM',
  PROMOTIONAL = 'PROMOTIONAL',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
  SMS = 'SMS',
}

export enum NotificationDeliveryStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true, sparse: true })
  userId?: Types.ObjectId;

  @Prop({ trim: true, index: true, sparse: true })
  recipientEmail?: string;

  @Prop({ trim: true, index: true, sparse: true })
  recipientPhone?: string;

  @Prop({ required: true, enum: NotificationType, index: true })
  type!: NotificationType;

  @Prop({ required: true, enum: NotificationChannel, default: NotificationChannel.IN_APP, index: true })
  channel!: NotificationChannel;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({ default: false, index: true })
  isRead!: boolean;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop({ required: true, enum: NotificationDeliveryStatus, default: NotificationDeliveryStatus.SENT })
  status!: NotificationDeliveryStatus;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
