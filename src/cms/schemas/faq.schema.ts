import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FaqDocument = Faq & Document;

@Schema({ timestamps: true })
export class Faq {
  @Prop({ required: true, trim: true })
  question!: string;

  @Prop({ required: true, trim: true })
  answer!: string;

  @Prop({ required: true, trim: true, default: 'General', index: true })
  category!: string;

  @Prop({ default: 0 })
  displayOrder!: number;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);

FaqSchema.index({ category: 1, displayOrder: 1 });
