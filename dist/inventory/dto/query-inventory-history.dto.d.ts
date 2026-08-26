import { InventoryAdjustmentType } from '../schemas/inventory-history.schema.js';
export declare class QueryInventoryHistoryDto {
    page?: number;
    limit?: number;
    sku?: string;
    adjustmentType?: InventoryAdjustmentType;
}
