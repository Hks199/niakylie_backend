import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnnouncementDocument = Announcement & Document;

@Schema({ timestamps: true })
export class Announcement {
  @Prop({ required: true, trim: true })
  text: string;

  @Prop({ required: false, trim: true, default: 'Announcement' })
  badge: string;

  @Prop({ required: false, trim: true, default: 'Tag' })
  icon: string;

  @Prop({ required: false, trim: true })
  link?: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, default: 0 })
  priority: number;

  @Prop({ required: true, default: false })
  isDeleted: boolean;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
AnnouncementSchema.index({ isActive: 1, isDeleted: 1, priority: -1 });
