import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PageDocument = Page & Document;

@Schema({ timestamps: true })
export class Page {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, unique: true, trim: true, index: true })
  slug!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ trim: true })
  metaTitle?: string;

  @Prop({ trim: true })
  metaDescription?: string;

  @Prop({ type: [String], default: [] })
  metaKeywords!: string[];

  @Prop({ default: true, index: true })
  isPublished!: boolean;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const PageSchema = SchemaFactory.createForClass(Page);
