import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type InventoryHistoryDocument = InventoryHistory & Document;

export enum InventoryAdjustmentType {
  RESTOCK = 'RESTOCK',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
  RESERVE = 'RESERVE',
  RELEASE_RESERVATION = 'RELEASE_RESERVATION',
  SALE_DEDUCTION = 'SALE_DEDUCTION',
  RETURN_RESTOCK = 'RETURN_RESTOCK',
  DAMAGE_LOSS = 'DAMAGE_LOSS',
}

@Schema({ timestamps: true })
export class InventoryHistory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Inventory', required: true, index: true })
  inventoryId!: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  sku!: string;

  @Prop({
    type: String,
    enum: Object.values(InventoryAdjustmentType),
    required: true,
    index: true,
  })
  adjustmentType!: InventoryAdjustmentType;

  @Prop({ required: true })
  previousStock!: number;

  @Prop({ required: true })
  quantityChanged!: number;

  @Prop({ required: true })
  newStock!: number;

  @Prop({ required: true, default: 0 })
  previousReserved!: number;

  @Prop({ required: true, default: 0 })
  newReserved!: number;

  @Prop({ trim: true })
  reason?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
  adjustedBy?: Types.ObjectId;
}

export const InventoryHistorySchema = SchemaFactory.createForClass(InventoryHistory);

// Indexes
InventoryHistorySchema.index({ sku: 1, createdAt: -1 });
InventoryHistorySchema.index({ inventoryId: 1, createdAt: -1 });
