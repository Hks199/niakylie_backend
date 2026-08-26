import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, index: true })
  variantId?: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true, index: true })
  sku!: string;

  @Prop({ required: true, default: 0, min: 0 })
  totalStock!: number;

  @Prop({ required: true, default: 0, min: 0 })
  reservedStock!: number;

  @Prop({ required: true, default: 0, min: 0, index: true })
  availableStock!: number;

  @Prop({ default: 0, min: 0 })
  soldStock!: number;

  @Prop({ required: true, default: 5, min: 0 })
  lowStockThreshold!: number;

  @Prop({
    type: String,
    enum: Object.values(StockStatus),
    default: StockStatus.OUT_OF_STOCK,
    index: true,
  })
  status!: StockStatus;

  @Prop({ default: false, index: true })
  isDeleted!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

// Indexes
InventorySchema.index({ sku: 1 }, { unique: true });
InventorySchema.index({ productId: 1, variantId: 1 });
InventorySchema.index({ status: 1 });
InventorySchema.index({ availableStock: 1 });
