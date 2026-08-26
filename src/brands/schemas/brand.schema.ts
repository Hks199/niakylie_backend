import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true, trim: true, unique: true })
  name!: string;

  @Prop({ required: true, unique: true, trim: true, index: true })
  slug!: string;

  @Prop({ required: false, trim: true })
  logo?: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ required: false, trim: true })
  seoTitle?: string;

  @Prop({ required: false, trim: true })
  seoDescription?: string;

  @Prop({ type: [String], default: [] })
  seoKeywords?: string[];

  @Prop({ default: true })
  status!: boolean;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

// Indexes
BrandSchema.index({ slug: 1 });
BrandSchema.index({ name: 'text', slug: 'text', description: 'text' });

