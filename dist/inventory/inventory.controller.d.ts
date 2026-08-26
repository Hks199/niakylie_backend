import { InventoryService } from './inventory.service.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { ReserveStockDto } from './dto/reserve-stock.dto.js';
import { QueryInventoryDto } from './dto/query-inventory.dto.js';
import { QueryInventoryHistoryDto } from './dto/query-inventory-history.dto.js';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    findAll(queryDto: QueryInventoryDto): Promise<{
        data: import("./schemas/inventory.schema.js").InventoryDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    getLowStockAlerts(queryDto: QueryInventoryDto): Promise<{
        data: import("./schemas/inventory.schema.js").InventoryDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    getHistory(queryDto: QueryInventoryHistoryDto): Promise<{
        data: import("./schemas/inventory-history.schema.js").InventoryHistoryDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    findBySku(sku: string): Promise<import("./schemas/inventory.schema.js").InventoryDocument>;
    adjustStock(dto: AdjustStockDto, req: any): Promise<import("./schemas/inventory.schema.js").InventoryDocument>;
    reserveStock(dto: ReserveStockDto, req: any): Promise<import("./schemas/inventory.schema.js").InventoryDocument>;
    releaseReservation(dto: ReserveStockDto, req: any): Promise<import("./schemas/inventory.schema.js").InventoryDocument>;
    deductReservedStock(dto: ReserveStockDto, req: any): Promise<import("./schemas/inventory.schema.js").InventoryDocument>;
}
