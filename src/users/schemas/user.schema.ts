import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../shared/index.js';
import { Address, AddressSchema } from './address.schema.js';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  })
  email!: string;

  @Prop({
    required: false,
    select: false, // Do not return password by default in queries
  })
  password?: string;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ required: false, trim: true })
  phone?: string;

  @Prop({
    type: [String],
    enum: Role,
    default: [Role.CUSTOMER],
  })
  roles!: Role[];

  @Prop({ default: false })
  isEmailVerified!: boolean;

  @Prop({ required: false, select: false })
  emailVerificationToken?: string;

  @Prop({ type: Date, required: false, select: false })
  emailVerificationExpires?: Date;

  @Prop({ required: false, select: false })
  passwordResetToken?: string;

  @Prop({ type: Date, required: false, select: false })
  passwordResetExpires?: Date;

  @Prop({
    type: [String],
    default: [],
    select: false, // Do not expose sessions/refresh tokens to API
  })
  refreshTokens!: string[];

  @Prop({ required: false, index: true })
  googleId?: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ required: false })
  avatar?: string;

  @Prop({ type: [AddressSchema], default: [] })
  addresses!: Address[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }], default: [] })
  wishlist!: Types.ObjectId[];

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  recentlyViewed!: Array<{ productId: Types.ObjectId; viewedAt: Date }>;

  @Prop({
    type: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    _id: false,
    default: { email: true, sms: true, push: true },
  })
  notificationPreferences!: { email: boolean; sms: boolean; push: boolean };

  @Prop({ type: Number, default: 0 })
  rewardPoints!: number;

  @Prop({
    type: {
      balance: { type: Number, default: 0 },
      history: [
        {
          amount: { type: Number, required: true },
          type: { type: String, enum: ['credit', 'debit'], required: true },
          reason: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
    _id: false,
    default: { balance: 0, history: [] },
  })
  wallet!: {
    balance: number;
    history: Array<{
      amount: number;
      type: 'credit' | 'debit';
      reason: string;
      createdAt: Date;
    }>;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Ensure index exists on email and googleId
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 }, { sparse: true });
