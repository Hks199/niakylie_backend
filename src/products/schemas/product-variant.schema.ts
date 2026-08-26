import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductVariantDocument = ProductVariant & Document;

@Schema({ _id: true, timestamps: false })
export class ProductVariant {
  _id!: Types.ObjectId;

  @Prop({ trim: true })
  sku?: string;

  @Prop({ trim: true })
  barcode?: string;

  @Prop({ required: true, trim: true })
  color!: string;

  @Prop({ trim: true })
  colorHex?: string;

  @Prop({ required: true, trim: true })
  size!: string;

  @Prop({ default: 0, min: 0 })
  stock!: number;

  @Prop({ required: true, min: 0 })
  mrp!: number;

  @Prop({ required: true, min: 0 })
  offerPrice!: number;

  @Prop({ default: 0, min: 0, max: 100 })
  discount!: number;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ default: true })
  isActive!: boolean;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);
