import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

export enum BannerType {
  HOMEPAGE = 'HOMEPAGE',
  OFFER = 'OFFER',
  FESTIVAL = 'FESTIVAL',
  POPUP = 'POPUP',
}

export enum BannerPosition {
  TOP = 'TOP',
  MIDDLE = 'MIDDLE',
  BOTTOM = 'BOTTOM',
  SIDEBAR = 'SIDEBAR',
}

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  subtitle?: string;

  @Prop({ trim: true })
  discountBadge?: string;

  @Prop({ required: true, enum: BannerType, index: true })
  type!: BannerType;

  @Prop({ required: true, enum: BannerPosition, default: BannerPosition.TOP })
  position!: BannerPosition;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop()
  mobileImageUrl?: string;

  @Prop({ trim: true })
  linkUrl?: string;

  @Prop({ trim: true })
  linkLabel?: string;

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  endDate?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

BannerSchema.index({ type: 1, isActive: 1, displayOrder: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });
