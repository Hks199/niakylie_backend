import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { InventoryService } from './inventory.service.js';
import { InventoryRepository } from './repositories/inventory.repository.js';
import { InventoryHistoryRepository } from './repositories/inventory-history.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { StockStatus } from './schemas/inventory.schema.js';
import { InventoryAdjustmentType } from './schemas/inventory-history.schema.js';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryRepo: jest.Mocked<InventoryRepository>;
  let historyRepo: jest.Mocked<InventoryHistoryRepository>;
  let productsRepo: jest.Mocked<ProductsRepository>;

  const mockInventory = {
    _id: new Types.ObjectId('60d5ecb8b392d40015f8a001'),
    productId: new Types.ObjectId('60d5ecb8b392d40015f8a002'),
    variantId: new Types.ObjectId('60d5ecb8b392d40015f8a003'),
    sku: 'NIA-TEST01',
    totalStock: 20,
    reservedStock: 0,
    availableStock: 20,
    lowStockThreshold: 5,
    status: StockStatus.IN_STOCK,
  };

  beforeEach(async () => {
    const mockInventoryRepo = {
      create: jest.fn(),
      findBySku: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateBySku: jest.fn(),
      reserveStockAtomic: jest.fn(),
    };

    const mockHistoryRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const mockProductsRepo = {
      updateVariant: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: InventoryRepository, useValue: mockInventoryRepo },
        { provide: InventoryHistoryRepository, useValue: mockHistoryRepo },
        { provide: ProductsRepository, useValue: mockProductsRepo },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    inventoryRepo = module.get(InventoryRepository);
    historyRepo = module.get(InventoryHistoryRepository);
    productsRepo = module.get(ProductsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('adjustStock', () => {
    it('should throw NotFoundException if SKU is missing', async () => {
      inventoryRepo.findBySku.mockResolvedValue(null);
      await expect(
        service.adjustStock({
          sku: 'NONEXISTENT',
          quantity: 10,
          adjustmentType: InventoryAdjustmentType.RESTOCK,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if adjustment causes negative total stock', async () => {
      inventoryRepo.findBySku.mockResolvedValue(mockInventory as any);
      await expect(
        service.adjustStock({
          sku: 'NIA-TEST01',
          quantity: -30,
          adjustmentType: InventoryAdjustmentType.DAMAGE_LOSS,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update stock, recalculate status to LOW_STOCK, sync product variant and create history entry', async () => {
      inventoryRepo.findBySku.mockResolvedValue(mockInventory as any);
      inventoryRepo.updateBySku.mockResolvedValue({
        ...mockInventory,
        totalStock: 4,
        availableStock: 4,
        status: StockStatus.LOW_STOCK,
      } as any);

      const result = await service.adjustStock({
        sku: 'NIA-TEST01',
        quantity: -16,
        adjustmentType: InventoryAdjustmentType.DAMAGE_LOSS,
      });

      expect(result.status).toBe(StockStatus.LOW_STOCK);
      expect(inventoryRepo.updateBySku).toHaveBeenCalledWith('NIA-TEST01', {
        $set: {
          totalStock: 4,
          availableStock: 4,
          lowStockThreshold: 5,
          status: StockStatus.LOW_STOCK,
        },
      });
      expect(productsRepo.updateVariant).toHaveBeenCalledWith(
        mockInventory.productId.toString(),
        mockInventory.variantId.toString(),
        { stock: 4 },
      );
      expect(historyRepo.create).toHaveBeenCalled();
    });
  });

  describe('reserveStock', () => {
    it('should throw BadRequestException if availableStock is insufficient', async () => {
      inventoryRepo.findBySku.mockResolvedValue({
        ...mockInventory,
        availableStock: 2,
      } as any);

      await expect(
        service.reserveStock({ sku: 'NIA-TEST01', quantity: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reserve stock successfully when availableStock is sufficient', async () => {
      inventoryRepo.findBySku.mockResolvedValue(mockInventory as any);
      inventoryRepo.updateBySku.mockResolvedValue({
        ...mockInventory,
        reservedStock: 5,
        availableStock: 15,
      } as any);

      const result = await service.reserveStock({ sku: 'NIA-TEST01', quantity: 5 });

      expect(inventoryRepo.updateBySku).toHaveBeenCalledWith('NIA-TEST01', {
        $set: {
          reservedStock: 5,
          availableStock: 15,
          status: StockStatus.IN_STOCK,
        },
      });
      expect(historyRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          adjustmentType: InventoryAdjustmentType.RESERVE,
          previousReserved: 0,
          newReserved: 5,
        }),
      );
    });
  });

  describe('releaseReservation', () => {
    it('should release reserved stock and recalculate available stock', async () => {
      const reservedInventory = {
        ...mockInventory,
        reservedStock: 5,
        availableStock: 15,
      };
      inventoryRepo.findBySku.mockResolvedValue(reservedInventory as any);
      inventoryRepo.updateBySku.mockResolvedValue({
        ...mockInventory,
        reservedStock: 0,
        availableStock: 20,
      } as any);

      await service.releaseReservation({ sku: 'NIA-TEST01', quantity: 5 });

      expect(inventoryRepo.updateBySku).toHaveBeenCalledWith('NIA-TEST01', {
        $set: {
          reservedStock: 0,
          availableStock: 20,
          status: StockStatus.IN_STOCK,
        },
      });
      expect(historyRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          adjustmentType: InventoryAdjustmentType.RELEASE_RESERVATION,
        }),
      );
    });
  });

  describe('deductReservedStock', () => {
    it('should deduct both totalStock and reservedStock on confirmed sale', async () => {
      const reservedInventory = {
        ...mockInventory,
        totalStock: 20,
        reservedStock: 5,
        availableStock: 15,
      };
      inventoryRepo.findBySku.mockResolvedValue(reservedInventory as any);
      inventoryRepo.updateBySku.mockResolvedValue({
        ...mockInventory,
        totalStock: 15,
        reservedStock: 0,
        availableStock: 15,
      } as any);

      await service.deductReservedStock({ sku: 'NIA-TEST01', quantity: 5 });

      expect(inventoryRepo.updateBySku).toHaveBeenCalledWith('NIA-TEST01', {
        $set: {
          totalStock: 15,
          reservedStock: 0,
          availableStock: 15,
          status: StockStatus.IN_STOCK,
        },
      });
      expect(productsRepo.updateVariant).toHaveBeenCalledWith(
        mockInventory.productId.toString(),
        mockInventory.variantId.toString(),
        { stock: 15 },
      );
      expect(historyRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          adjustmentType: InventoryAdjustmentType.SALE_DEDUCTION,
          quantityChanged: -5,
        }),
      );
    });
  });
});
