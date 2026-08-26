import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service.js';
import { Order, OrderStatus } from '../checkout/schemas/order.schema.js';
import { Product } from '../products/schemas/product.schema.js';
import { Inventory } from '../inventory/schemas/inventory.schema.js';
import { User } from '../users/schemas/user.schema.js';
import { RedisCacheService } from '../cache/cache.service.js';
import { AggregationPeriod } from './dto/dashboard-query.dto.js';

describe('DashboardService', () => {
  let service: DashboardService;
  let orderModel: any;
  let productModel: any;
  let inventoryModel: any;
  let userModel: any;
  let cacheService: jest.Mocked<RedisCacheService>;

  beforeEach(async () => {
    orderModel = {
      aggregate: jest.fn(),
      countDocuments: jest.fn(),
    };

    productModel = {
      countDocuments: jest.fn(),
    };

    inventoryModel = {
      aggregate: jest.fn(),
      countDocuments: jest.fn(),
    };

    userModel = {
      countDocuments: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn().mockResolvedValue(undefined),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: getModelToken(Product.name), useValue: productModel },
        { provide: getModelToken(Inventory.name), useValue: inventoryModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: RedisCacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    cacheService = module.get(RedisCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should aggregate total revenue, orders, AOV, customers, products, and inventory alerts', async () => {
      orderModel.aggregate.mockResolvedValue([{ totalRevenue: 15000, count: 10 }]);
      orderModel.countDocuments.mockResolvedValue(10);
      userModel.countDocuments.mockResolvedValueOnce(50).mockResolvedValueOnce(5);
      productModel.countDocuments.mockResolvedValue(20);
      inventoryModel.countDocuments.mockResolvedValueOnce(2).mockResolvedValueOnce(3);

      const result = await service.getSummary({});

      expect(result.totalRevenue).toBe(15000);
      expect(result.totalOrders).toBe(10);
      expect(result.averageOrderValue).toBe(1500);
      expect(result.totalCustomers).toBe(50);
      expect(result.newCustomers).toBe(5);
      expect(result.totalProducts).toBe(20);
      expect(result.inventoryAlerts.outOfStockCount).toBe(2);
      expect(result.inventoryAlerts.lowStockCount).toBe(3);
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should return cached metrics if available in Redis', async () => {
      const cachedSummary = { totalRevenue: 10000, totalOrders: 5 };
      cacheService.get.mockResolvedValue(cachedSummary);

      const result = await service.getSummary({});

      expect(result).toBe(cachedSummary);
      expect(orderModel.aggregate).not.toHaveBeenCalled();
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should run date grouping pipeline for monthly period', async () => {
      const mockAnalytics = [{ period: '2026-08', revenue: 12000, orders: 8, avgOrderValue: 1500 }];
      orderModel.aggregate.mockResolvedValue(mockAnalytics);

      const result = await service.getRevenueAnalytics({ period: AggregationPeriod.MONTHLY });

      expect(orderModel.aggregate).toHaveBeenCalled();
      expect(result).toBe(mockAnalytics);
    });
  });

  describe('getOrderStatusBreakdown', () => {
    it('should return count and revenue breakdown per status', async () => {
      const mockBreakdown = [{ status: OrderStatus.DELIVERED, count: 5, totalValue: 7500 }];
      orderModel.aggregate.mockResolvedValue(mockBreakdown);

      const result = await service.getOrderStatusBreakdown({});

      expect(result).toBe(mockBreakdown);
    });
  });

  describe('getTopProducts', () => {
    it('should unwind order items and rank products by revenue', async () => {
      const mockTop = [{ productId: 'prod1', productName: 'Silk Saree', totalRevenue: 5000 }];
      orderModel.aggregate.mockResolvedValue(mockTop);

      const result = await service.getTopProducts({ limit: 5 });

      expect(orderModel.aggregate).toHaveBeenCalled();
      expect(result).toBe(mockTop);
    });
  });

  describe('getTopCategories', () => {
    it('should calculate category revenue', async () => {
      const mockCategories = [{ categoryName: 'Sarees', totalRevenue: 10000, itemsSold: 12 }];
      orderModel.aggregate.mockResolvedValue(mockCategories);

      const result = await service.getTopCategories({ limit: 5 });

      expect(result).toBe(mockCategories);
    });
  });

  describe('getTopCustomers', () => {
    it('should rank customers by total spend', async () => {
      const mockCustomers = [{ userId: 'user1', name: 'John Doe', totalSpent: 8000, orderCount: 3 }];
      orderModel.aggregate.mockResolvedValue(mockCustomers);

      const result = await service.getTopCustomers({ limit: 5 });

      expect(result).toBe(mockCustomers);
    });
  });

  describe('getInventoryAlerts', () => {
    it('should aggregate out-of-stock and low-stock items', async () => {
      inventoryModel.aggregate.mockResolvedValueOnce([{ productId: 'p1' }]).mockResolvedValueOnce([{ productId: 'p2' }]);

      const result = await service.getInventoryAlerts();

      expect(result.outOfStockCount).toBe(1);
      expect(result.lowStockCount).toBe(1);
    });
  });

  describe('clearCache', () => {
    it('should reset cache store', async () => {
      const result = await service.clearCache();
      expect(cacheService.reset).toHaveBeenCalled();
      expect(result.message).toContain('cleared');
    });
  });
});
