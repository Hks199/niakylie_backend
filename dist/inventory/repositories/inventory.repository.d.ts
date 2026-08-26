import { Model, UpdateQuery } from 'mongoose';
import { Inventory, InventoryDocument } from '../schemas/inventory.schema.js';
import { QueryInventoryDto } from '../dto/query-inventory.dto.js';
export declare class InventoryRepository {
    private readonly inventoryModel;
    constructor(inventoryModel: Model<InventoryDocument>);
    create(data: Partial<Inventory>): Promise<InventoryDocument>;
    findBySku(sku: string): Promise<InventoryDocument | null>;
    findById(id: string): Promise<InventoryDocument | null>;
    findByProductAndVariant(productId: string, variantId?: string): Promise<InventoryDocument | null>;
    findAll(queryDto: QueryInventoryDto): Promise<{
        data: InventoryDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(id: string, updateData: UpdateQuery<InventoryDocument>): Promise<InventoryDocument | null>;
    updateBySku(sku: string, updateData: UpdateQuery<InventoryDocument>): Promise<InventoryDocument | null>;
    reserveStockAtomic(sku: string, quantity: number): Promise<InventoryDocument | null>;
}
