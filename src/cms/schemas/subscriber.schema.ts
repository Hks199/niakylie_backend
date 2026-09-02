import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriberDocument = Subscriber & Document;

@Schema({ timestamps: true })
export class Subscriber {
  @Prop({ trim: true, lowercase: true, index: true, sparse: true })
  email?: string;

  @Prop({ trim: true, index: true, sparse: true })
  phone?: string;

  @Prop({ trim: true, default: 'FOOTER' })
  source?: string;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ type: Date, default: Date.now })
  subscribedAt!: Date;
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
SubscriberSchema.index({ email: 1 });
SubscriberSchema.index({ phone: 1 });
SubscriberSchema.index({ createdAt: -1 });
