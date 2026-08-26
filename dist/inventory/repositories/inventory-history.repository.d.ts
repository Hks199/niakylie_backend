import { Model } from 'mongoose';
import { InventoryHistory, InventoryHistoryDocument } from '../schemas/inventory-history.schema.js';
import { QueryInventoryHistoryDto } from '../dto/query-inventory-history.dto.js';
export declare class InventoryHistoryRepository {
    private readonly historyModel;
    constructor(historyModel: Model<InventoryHistoryDocument>);
    create(data: Partial<InventoryHistory>): Promise<InventoryHistoryDocument>;
    findAll(queryDto: QueryInventoryHistoryDto): Promise<{
        data: InventoryHistoryDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
}
