import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { InventoryRepository } from './repositories/inventory.repository.js';
import { InventoryHistoryRepository } from './repositories/inventory-history.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { ReserveStockDto } from './dto/reserve-stock.dto.js';
import { QueryInventoryDto } from './dto/query-inventory.dto.js';
import { QueryInventoryHistoryDto } from './dto/query-inventory-history.dto.js';
import { InventoryDocument, StockStatus } from './schemas/inventory.schema.js';
import { InventoryAdjustmentType } from './schemas/inventory-history.schema.js';

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly historyRepository: InventoryHistoryRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  private calculateStatus(availableStock: number, lowStockThreshold: number): StockStatus {
    if (availableStock <= 0) return StockStatus.OUT_OF_STOCK;
    if (availableStock <= lowStockThreshold) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  }

  async adjustStock(dto: AdjustStockDto, userId?: string): Promise<InventoryDocument> {
    const { sku, quantity, adjustmentType, reason, lowStockThreshold } = dto;
    let inventory = await this.inventoryRepository.findBySku(sku);

    if (!inventory) {
      throw new NotFoundException(`Inventory record for SKU '${sku}' not found`);
    }

    const previousStock = inventory.totalStock;
    const newStock = previousStock + quantity;

    if (newStock < 0) {
      throw new BadRequestException(
        `Adjustment results in negative stock (${newStock}). Current stock is ${previousStock}.`,
      );
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

    // Sync product variant stock in Product collection
    if (inventory.productId && inventory.variantId) {
      await this.productsRepository.updateVariant(
        inventory.productId.toString(),
        inventory.variantId.toString(),
        { stock: newStock },
      );
    }

    // Create Audit Log
    await this.historyRepository.create({
      inventoryId: inventory._id as Types.ObjectId,
      productId: inventory.productId as Types.ObjectId,
      sku,
      adjustmentType,
      previousStock,
      quantityChanged: quantity,
      newStock,
      previousReserved: inventory.reservedStock,
      newReserved: inventory.reservedStock,
      reason,
      adjustedBy: userId ? new Types.ObjectId(userId) : undefined,
    });

    return updated!;
  }

  async reserveStock(dto: ReserveStockDto, userId?: string): Promise<InventoryDocument> {
    const { sku, quantity } = dto;
    const inventory = await this.inventoryRepository.findBySku(sku);

    if (!inventory) {
      throw new NotFoundException(`Inventory for SKU '${sku}' not found`);
    }

    if (inventory.availableStock < quantity) {
      throw new BadRequestException(
        `Insufficient available stock for SKU '${sku}'. Requested: ${quantity}, Available: ${inventory.availableStock}`,
      );
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
      inventoryId: inventory._id as Types.ObjectId,
      productId: inventory.productId as Types.ObjectId,
      sku,
      adjustmentType: InventoryAdjustmentType.RESERVE,
      previousStock: inventory.totalStock,
      quantityChanged: 0,
      newStock: inventory.totalStock,
      previousReserved,
      newReserved,
      reason: dto.orderId ? `Reserved for order #${dto.orderId}` : 'Cart / Checkout reservation',
      adjustedBy: userId ? new Types.ObjectId(userId) : undefined,
    });

    return updated!;
  }

  async releaseReservation(dto: ReserveStockDto, userId?: string): Promise<InventoryDocument> {
    const { sku, quantity } = dto;
    const inventory = await this.inventoryRepository.findBySku(sku);

    if (!inventory) {
      throw new NotFoundException(`Inventory for SKU '${sku}' not found`);
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
      inventoryId: inventory._id as Types.ObjectId,
      productId: inventory.productId as Types.ObjectId,
      sku,
      adjustmentType: InventoryAdjustmentType.RELEASE_RESERVATION,
      previousStock: inventory.totalStock,
      quantityChanged: 0,
      newStock: inventory.totalStock,
      previousReserved,
      newReserved,
      reason: dto.orderId ? `Released for order #${dto.orderId}` : 'Reservation release',
      adjustedBy: userId ? new Types.ObjectId(userId) : undefined,
    });

    return updated!;
  }

  async deductReservedStock(dto: ReserveStockDto, userId?: string): Promise<InventoryDocument> {
    const { sku, quantity } = dto;
    const inventory = await this.inventoryRepository.findBySku(sku);

    if (!inventory) {
      throw new NotFoundException(`Inventory for SKU '${sku}' not found`);
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
      await this.productsRepository.updateVariant(
        inventory.productId.toString(),
        inventory.variantId.toString(),
        { stock: newStock },
      );
    }

    await this.historyRepository.create({
      inventoryId: inventory._id as Types.ObjectId,
      productId: inventory.productId as Types.ObjectId,
      sku,
      adjustmentType: InventoryAdjustmentType.SALE_DEDUCTION,
      previousStock,
      quantityChanged: -quantity,
      newStock,
      previousReserved,
      newReserved,
      reason: dto.orderId ? `Confirmed sale order #${dto.orderId}` : 'Confirmed sale deduction',
      adjustedBy: userId ? new Types.ObjectId(userId) : undefined,
    });

    return updated!;
  }

  async findBySku(sku: string): Promise<InventoryDocument> {
    const inventory = await this.inventoryRepository.findBySku(sku);
    if (!inventory) {
      throw new NotFoundException(`Inventory for SKU '${sku}' not found`);
    }
    return inventory;
  }

  async findAll(queryDto: QueryInventoryDto) {
    return this.inventoryRepository.findAll(queryDto);
  }

  async getLowStockAlerts(queryDto: QueryInventoryDto) {
    return this.inventoryRepository.findAll({ ...queryDto, lowStockOnly: true });
  }

  async getHistory(queryDto: QueryInventoryHistoryDto) {
    return this.historyRepository.findAll(queryDto);
  }
}
