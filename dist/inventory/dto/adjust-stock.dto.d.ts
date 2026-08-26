import { InventoryAdjustmentType } from '../schemas/inventory-history.schema.js';
export declare class AdjustStockDto {
    sku: string;
    quantity: number;
    adjustmentType: InventoryAdjustmentType;
    reason?: string;
    lowStockThreshold?: number;
}
