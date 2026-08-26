import { Test, TestingModule } from '@nestjs/testing';

import { InventoryController } from './inventory.controller.js';
import { InventoryService } from './inventory.service.js';
import { StockStatus } from './schemas/inventory.schema.js';
import { InventoryAdjustmentType } from './schemas/inventory-history.schema.js';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: jest.Mocked<InventoryService>;

  beforeEach(async () => {
    const mockInventoryService = {
      findAll: jest.fn(),
      getLowStockAlerts: jest.fn(),
      getHistory: jest.fn(),
      findBySku: jest.fn(),
      adjustStock: jest.fn(),
      reserveStock: jest.fn(),
      releaseReservation: jest.fn(),
      deductReservedStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [{ provide: InventoryService, useValue: mockInventoryService }],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get(InventoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to inventoryService.findAll', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 10 };
      service.findAll.mockResolvedValue(mockResult);

      const query = { page: 1, limit: 10 };
      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toBe(mockResult);
    });
  });

  describe('getLowStockAlerts', () => {
    it('should delegate to inventoryService.getLowStockAlerts', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 10 };
      service.getLowStockAlerts.mockResolvedValue(mockResult);

      const query = { page: 1, limit: 10 };
      const result = await controller.getLowStockAlerts(query);

      expect(service.getLowStockAlerts).toHaveBeenCalledWith(query);
      expect(result).toBe(mockResult);
    });
  });

  describe('adjustStock', () => {
    it('should delegate to inventoryService.adjustStock with req user ID', async () => {
      const mockResponse = { sku: 'NIA-A1', totalStock: 50 } as any;
      service.adjustStock.mockResolvedValue(mockResponse);

      const dto = {
        sku: 'NIA-A1',
        quantity: 10,
        adjustmentType: InventoryAdjustmentType.RESTOCK,
      };
      const req = { user: { id: 'admin123' } };

      const result = await controller.adjustStock(dto, req);

      expect(service.adjustStock).toHaveBeenCalledWith(dto, 'admin123');
      expect(result).toBe(mockResponse);
    });
  });

  describe('reserveStock', () => {
    it('should delegate to inventoryService.reserveStock', async () => {
      const mockResponse = { sku: 'NIA-A1', reservedStock: 2 } as any;
      service.reserveStock.mockResolvedValue(mockResponse);

      const dto = { sku: 'NIA-A1', quantity: 2 };
      const req = { user: { id: 'user123' } };

      const result = await controller.reserveStock(dto, req);

      expect(service.reserveStock).toHaveBeenCalledWith(dto, 'user123');
      expect(result).toBe(mockResponse);
    });
  });
});
