"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const inventory_repository_js_1 = require("./repositories/inventory.repository.js");
const inventory_history_repository_js_1 = require("./repositories/inventory-history.repository.js");
const products_repository_js_1 = require("../products/repositories/products.repository.js");
const inventory_schema_js_1 = require("./schemas/inventory.schema.js");
const inventory_history_schema_js_1 = require("./schemas/inventory-history.schema.js");
let InventoryService = class InventoryService {
    inventoryRepository;
    historyRepository;
    productsRepository;
    constructor(inventoryRepository, historyRepository, productsRepository) {
        this.inventoryRepository = inventoryRepository;
        this.historyRepository = historyRepository;
        this.productsRepository = productsRepository;
    }
    calculateStatus(availableStock, lowStockThreshold) {
        if (availableStock <= 0)
            return inventory_schema_js_1.StockStatus.OUT_OF_STOCK;
        if (availableStock <= lowStockThreshold)
            return inventory_schema_js_1.StockStatus.LOW_STOCK;
        return inventory_schema_js_1.StockStatus.IN_STOCK;
    }
    async adjustStock(dto, userId) {
        const { sku, quantity, adjustmentType, reason, lowStockThreshold } = dto;
        let inventory = await this.inventoryRepository.findBySku(sku);
        if (!inventory) {
            throw new common_1.NotFoundException(`Inventory record for SKU '${sku}' not found`);
        }
        const previousStock = inventory.totalStock;
        const newStock = previousStock + quantity;
        if (newStock < 0) {
            throw new common_1.BadRequestException(`Adjustment results in negative stock (${newStock}). Current stock is ${previousStock}.`);
        }
        const threshold = lowStockThreshold ?? inventory.lowStockThreshold;
        const availableStock = newStock - inventory.reservedStock;
        const status = this.calculateStatus(availableStock, threshold);
        const updated = await this.inventoryRepository.updateBySku(sku, {
            $set: {
                totalStock: newStock,
                availableStock,
                lowStockThreshold: threshold,
                status,
            },
        });
        if (inventory.productId && inventory.variantId) {
            await this.productsRepository.updateVariant(inventory.productId.toString(), inventory.variantId.toString(), { stock: newStock });
        }
        await this.historyRepository.create({
            inventoryId: inventory._id,
            productId: inventory.productId,
            sku,
            adjustmentType,
            previousStock,
            quantityChanged: quantity,
            newStock,
            previousReserved: inventory.reservedStock,
            newReserved: inventory.reservedStock,
            reason,
            adjustedBy: userId ? new mongoose_1.Types.ObjectId(userId) : undefined,
        });
        return updated;
    }
    async reserveStock(dto, userId) {
        const { sku, quantity } = dto;
        const inventory = await this.inventoryRepository.findBySku(sku);
        if (!inventory) {
            throw new common_1.NotFoundException(`Inventory for SKU '${sku}' not found`);
        }
        if (inventory.availableStock < quantity) {
            throw new common_1.BadRequestException(`Insufficient available stock for SKU '${sku}'. Requested: ${quantity}, Available: ${inventory.availableStock}`);
        }
        const previousReserved = inventory.reservedStock;
        const newReserved = previousReserved + quantity;
        const availableStock = inventory.totalStock - newReserved;
        const status = this.calculateStatus(availableStock, inventory.lowStockThreshold);
        const updated = await this.inventoryRepository.updateBySku(sku, {
            $set: {
                reservedStock: newReserved,
                availableStock,
                status,
            },
        });
        await this.historyRepository.create({
            inventoryId: inventory._id,
            productId: inventory.productId,
            sku,
            adjustmentType: inventory_history_schema_js_1.InventoryAdjustmentType.RESERVE,
            previousStock: inventory.totalStock,
            quantityChanged: 0,
            newStock: inventory.totalStock,
            previousReserved,
            newReserved,
            reason: dto.orderId ? `Reserved for order #${dto.orderId}` : 'Cart / Checkout reservation',
            adjustedBy: userId ? new mongoose_1.Types.ObjectId(userId) : undefined,
        });
        return updated;
    }
    async releaseReservation(dto, userId) {
        const { sku, quantity } = dto;
        const inventory = await this.inventoryRepository.findBySku(sku);
        if (!inventory) {
            throw new common_1.NotFoundException(`Inventory for SKU '${sku}' not found`);
        }
        const previousReserved = inventory.reservedStock;
        const newReserved = Math.max(0, previousReserved - quantity);
        const availableStock = inventory.totalStock - newReserved;
        const status = this.calculateStatus(availableStock, inventory.lowStockThreshold);
        const updated = await this.inventoryRepository.updateBySku(sku, {
            $set: {
                reservedStock: newReserved,
                availableStock,
                status,
            },
        });
        await this.historyRepository.create({
            inventoryId: inventory._id,
            productId: inventory.productId,
            sku,
            adjustmentType: inventory_history_schema_js_1.InventoryAdjustmentType.RELEASE_RESERVATION,
            previousStock: inventory.totalStock,
            quantityChanged: 0,
            newStock: inventory.totalStock,
            previousReserved,
            newReserved,
            reason: dto.orderId ? `Released for order #${dto.orderId}` : 'Reservation release',
            adjustedBy: userId ? new mongoose_1.Types.ObjectId(userId) : undefined,
        });
        return updated;
    }
    async deductReservedStock(dto, userId) {
        const { sku, quantity } = dto;
        const inventory = await this.inventoryRepository.findBySku(sku);
        if (!inventory) {
            throw new common_1.NotFoundException(`Inventory for SKU '${sku}' not found`);
        }
        const previousStock = inventory.totalStock;
        const newStock = Math.max(0, previousStock - quantity);
        const previousReserved = inventory.reservedStock;
        const newReserved = Math.max(0, previousReserved - quantity);
        const availableStock = newStock - newReserved;
        const status = this.calculateStatus(availableStock, inventory.lowStockThreshold);
        const updated = await this.inventoryRepository.updateBySku(sku, {
            $set: {
                totalStock: newStock,
                reservedStock: newReserved,
                availableStock,
                status,
            },
        });
        if (inventory.productId && inventory.variantId) {
            await this.productsRepository.updateVariant(inventory.productId.toString(), inventory.variantId.toString(), { stock: newStock });
        }
        await this.historyRepository.create({
            inventoryId: inventory._id,
            productId: inventory.productId,
            sku,
            adjustmentType: inventory_history_schema_js_1.InventoryAdjustmentType.SALE_DEDUCTION,
            previousStock,
            quantityChanged: -quantity,
            newStock,
            previousReserved,
            newReserved,
            reason: dto.orderId ? `Confirmed sale order #${dto.orderId}` : 'Confirmed sale deduction',
            adjustedBy: userId ? new mongoose_1.Types.ObjectId(userId) : undefined,
        });
        return updated;
    }
    async findBySku(sku) {
        const inventory = await this.inventoryRepository.findBySku(sku);
        if (!inventory) {
            throw new common_1.NotFoundException(`Inventory for SKU '${sku}' not found`);
        }
        return inventory;
    }
    async findAll(queryDto) {
        return this.inventoryRepository.findAll(queryDto);
    }
    async getLowStockAlerts(queryDto) {
        return this.inventoryRepository.findAll({ ...queryDto, lowStockOnly: true });
    }
    async getHistory(queryDto) {
        return this.historyRepository.findAll(queryDto);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [inventory_repository_js_1.InventoryRepository,
        inventory_history_repository_js_1.InventoryHistoryRepository,
        products_repository_js_1.ProductsRepository])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map