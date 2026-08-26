import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: jest.Mocked<DashboardService>;

  beforeEach(async () => {
    const mockService = {
      getSummary: jest.fn(),
      getRevenueAnalytics: jest.fn(),
      getOrderStatusBreakdown: jest.fn(),
      getTopProducts: jest.fn(),
      getTopCategories: jest.fn(),
      getTopCustomers: jest.fn(),
      getInventoryAlerts: jest.fn(),
      clearCache: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: mockService }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should delegate summary to service', async () => {
      const mockSummary = { totalRevenue: 10000, totalOrders: 10 };
      service.getSummary.mockResolvedValue(mockSummary as any);

      const result = await controller.getSummary({});
      expect(service.getSummary).toHaveBeenCalledWith({});
      expect(result).toBe(mockSummary);
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should delegate revenue analytics to service', async () => {
      service.getRevenueAnalytics.mockResolvedValue([]);

      const result = await controller.getRevenueAnalytics({});
      expect(service.getRevenueAnalytics).toHaveBeenCalledWith({});
      expect(result).toEqual([]);
    });
  });

  describe('getOrderStatusBreakdown', () => {
    it('should delegate order status breakdown to service', async () => {
      service.getOrderStatusBreakdown.mockResolvedValue([]);

      const result = await controller.getOrderStatusBreakdown({});
      expect(service.getOrderStatusBreakdown).toHaveBeenCalledWith({});
      expect(result).toEqual([]);
    });
  });

  describe('getTopProducts', () => {
    it('should delegate top products to service', async () => {
      service.getTopProducts.mockResolvedValue([]);

      const result = await controller.getTopProducts({ limit: 5 });
      expect(service.getTopProducts).toHaveBeenCalledWith({ limit: 5 });
      expect(result).toEqual([]);
    });
  });

  describe('getInventoryAlerts', () => {
    it('should delegate inventory alerts to service', async () => {
      service.getInventoryAlerts.mockResolvedValue({ outOfStockCount: 0, lowStockCount: 0 } as any);

      const result = await controller.getInventoryAlerts();
      expect(service.getInventoryAlerts).toHaveBeenCalled();
      expect(result.outOfStockCount).toBe(0);
    });
  });

  describe('clearCache', () => {
    it('should delegate cache clearing to service', async () => {
      service.clearCache.mockResolvedValue({ message: 'Cleared' });

      const result = await controller.clearCache();
      expect(service.clearCache).toHaveBeenCalled();
      expect(result.message).toBe('Cleared');
    });
  });
});
