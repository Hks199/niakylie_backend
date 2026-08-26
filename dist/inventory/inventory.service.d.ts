import { InventoryRepository } from './repositories/inventory.repository.js';
import { InventoryHistoryRepository } from './repositories/inventory-history.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { ReserveStockDto } from './dto/reserve-stock.dto.js';
import { QueryInventoryDto } from './dto/query-inventory.dto.js';
import { QueryInventoryHistoryDto } from './dto/query-inventory-history.dto.js';
import { InventoryDocument } from './schemas/inventory.schema.js';
export declare class InventoryService {
    private readonly inventoryRepository;
    private readonly historyRepository;
    private readonly productsRepository;
    constructor(inventoryRepository: InventoryRepository, historyRepository: InventoryHistoryRepository, productsRepository: ProductsRepository);
    private calculateStatus;
    adjustStock(dto: AdjustStockDto, userId?: string): Promise<InventoryDocument>;
    reserveStock(dto: ReserveStockDto, userId?: string): Promise<InventoryDocument>;
    releaseReservation(dto: ReserveStockDto, userId?: string): Promise<InventoryDocument>;
    deductReservedStock(dto: ReserveStockDto, userId?: string): Promise<InventoryDocument>;
    findBySku(sku: string): Promise<InventoryDocument>;
    findAll(queryDto: QueryInventoryDto): Promise<{
        data: InventoryDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    getLowStockAlerts(queryDto: QueryInventoryDto): Promise<{
        data: InventoryDocument[];
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
}
