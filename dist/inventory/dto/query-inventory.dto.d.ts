import { StockStatus } from '../schemas/inventory.schema.js';
export declare class QueryInventoryDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: StockStatus;
    lowStockOnly?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
