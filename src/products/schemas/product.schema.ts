import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { ProductVariant, ProductVariantSchema } from './product-variant.schema.js';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, trim: true, index: true })
  slug!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  shortDescription?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true, index: true })
  categoryId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Brand', index: true })
  brandId?: Types.ObjectId;

  @Prop({ type: [ProductVariantSchema], default: [] })
  variants!: ProductVariant[];

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ trim: true })
  material?: string;

  @Prop({ trim: true })
  pattern?: string;

  @Prop({ trim: true })
  season?: string;

  @Prop({ trim: true })
  productCollection?: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: 0, min: 0 })
  tax!: number;

  @Prop({ default: false })
  isFeatured!: boolean;

  @Prop({ default: false })
  isTrending!: boolean;

  @Prop({ default: false })
  isBestSeller!: boolean;

  @Prop({ default: true })
  status!: boolean;

  @Prop({ default: 0 })
  reviewsCount!: number;

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating!: number;

  @Prop({ trim: true })
  seoTitle?: string;

  @Prop({ trim: true })
  seoDescription?: string;

  @Prop({ type: [String], default: [] })
  seoKeywords!: string[];

  @Prop({ default: false, index: true })
  isDeleted!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Compound & text indexes
ProductSchema.index({ slug: 1 });
ProductSchema.index({ categoryId: 1, status: 1, isDeleted: 1 });
ProductSchema.index({ brandId: 1, status: 1, isDeleted: 1 });
ProductSchema.index({ isFeatured: 1, status: 1 });
ProductSchema.index({ isTrending: 1, status: 1 });
ProductSchema.index({ isBestSeller: 1, status: 1 });
ProductSchema.index({ averageRating: -1, status: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ 'variants.sku': 1 }, { unique: true, sparse: true });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
