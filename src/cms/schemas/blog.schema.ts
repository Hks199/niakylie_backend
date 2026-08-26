import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, trim: true, index: true })
  slug!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ trim: true })
  summary?: string;

  @Prop({ trim: true })
  coverImage?: string;

  @Prop({ required: true, trim: true, default: 'NiaKylie Team' })
  author!: string;

  @Prop({ required: true, trim: true, default: 'Fashion', index: true })
  category!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: 0, min: 0 })
  viewCount!: number;

  @Prop({ default: true, index: true })
  isPublished!: boolean;

  @Prop({ type: Date, default: Date.now, index: true })
  publishedAt!: Date;

  @Prop({ trim: true })
  metaTitle?: string;

  @Prop({ trim: true })
  metaDescription?: string;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.index({ isPublished: 1, publishedAt: -1 });
BlogSchema.index({ category: 1, isPublished: 1 });
