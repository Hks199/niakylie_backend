import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  userName!: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop({ trim: true })
  title?: string;

  @Prop({ required: true, trim: true })
  comment!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: [String], default: [] })
  videos!: string[];

  @Prop({ default: false, index: true })
  isVerifiedPurchase!: boolean;

  @Prop({ default: 0, min: 0 })
  helpfulVotes!: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  votedUserIds!: Types.ObjectId[];

  @Prop({ required: true, enum: ReviewStatus, default: ReviewStatus.APPROVED, index: true })
  status!: ReviewStatus;

  @Prop({ trim: true })
  adminResponse?: string;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
