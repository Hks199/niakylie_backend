import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ _id: false })
export class CategoryAncestor {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  _id!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  slug!: string;
}

const CategoryAncestorSchema = SchemaFactory.createForClass(CategoryAncestor);

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true, unique: true })
  name!: string;

  @Prop({ required: true, unique: true, trim: true, index: true })
  slug!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', default: null, index: true })
  parentId!: Types.ObjectId | null;

  @Prop({ type: [CategoryAncestorSchema], default: [] })
  ancestors!: CategoryAncestor[];

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  image?: string;

  @Prop({ trim: true })
  banner?: string;

  @Prop({ default: true })
  status!: boolean;

  @Prop({ trim: true })
  seoTitle?: string;

  @Prop({ trim: true })
  seoDescription?: string;

  @Prop({ type: [String], default: [] })
  seoKeywords?: string[];

  @Prop({ default: false, index: true })
  isDeleted!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ 'ancestors._id': 1 });
CategorySchema.index({ name: 'text', slug: 'text', description: 'text' });

