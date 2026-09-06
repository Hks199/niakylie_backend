import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { OrdersService } from './orders.service.js';
import { OrdersRepository } from '../checkout/repositories/orders.repository.js';
import { OrderStatus } from '../checkout/schemas/order.schema.js';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepo: jest.Mocked<OrdersRepository>;

  const orderId = new Types.ObjectId('60d5ecb8b392d40015f8a001');
  const userId = new Types.ObjectId('60d5ecb8b392d40015f8a002');

  const mockOrder = {
    _id: orderId,
    orderNumber: 'NK-ORD-20260808-1234',
    invoiceNumber: 'NK-INV-2026-1234',
    userId,
    orderStatus: OrderStatus.CONFIRMED,
    timeline: [
      { status: OrderStatus.CONFIRMED, title: 'Order Confirmed', timestamp: new Date('2026-08-08T05:00:00Z') },
    ],
    customerInfo: { email: 'user@test.com', firstName: 'Jane', lastName: 'Doe', phone: '+91987654' },
    shippingAddress: { street: '1 Main St', city: 'Mumbai', state: 'MH', postalCode: '400001', country: 'India', phone: '+91987654' },
    billingAddress: { street: '1 Main St', city: 'Mumbai', state: 'MH', postalCode: '400001', country: 'India', phone: '+91987654' },
    items: [{ sku: 'SKU001', name: 'Silk Saree', quantity: 1, unitPrice: 1000, unitMrp: 1500, totalPrice: 1000 }],
    pricing: { subtotal: 1000, totalMrp: 1500, totalDiscount: 500, couponDiscount: 0, tax: 180, shippingFee: 0, grandTotal: 1180 },
    paymentInfo: { method: 'COD', status: 'PENDING' },
    shippingInfo: { method: 'STANDARD', fee: 0 },
    returnInfo: undefined,
    isDeleted: false,
  };

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOrderNumber: jest.fn(),
      findByInvoiceNumber: jest.fn(),
      findByUserId: jest.fn(),
      findByGuestId: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
      updateTracking: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersRepo = module.get(OrdersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateStatus', () => {
    it('should successfully transition CONFIRMED → PACKED', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue(null);
      ordersRepo.findById.mockResolvedValue(mockOrder as any);
      ordersRepo.updateStatus.mockResolvedValue({ ...mockOrder, orderStatus: OrderStatus.PACKED } as any);

      const result = await service.updateStatus(orderId.toString(), {
        status: OrderStatus.PACKED,
        notes: 'Packed and labelled',
      });

      expect(result.orderStatus).toBe(OrderStatus.PACKED);
    });

    it('should reject invalid status transition', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue(null);
      ordersRepo.findById.mockResolvedValue(mockOrder as any); // CONFIRMED

      await expect(
        service.updateStatus(orderId.toString(), { status: OrderStatus.DELIVERED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject REFUNDED from CONFIRMED (invalid transition)', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue(null);
      ordersRepo.findById.mockResolvedValue(mockOrder as any);

      await expect(
        service.updateStatus(orderId.toString(), { status: OrderStatus.REFUNDED }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel a CONFIRMED order', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue(mockOrder as any);
      ordersRepo.updateStatus.mockResolvedValue({ ...mockOrder, orderStatus: OrderStatus.CANCELLED } as any);

      const result = await service.cancelOrder('NK-ORD-20260808-1234', { reason: 'Changed my mind' });
      expect(result.orderStatus).toBe(OrderStatus.CANCELLED);
    });

    it('should reject cancellation for SHIPPED order', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue({ ...mockOrder, orderStatus: OrderStatus.SHIPPED } as any);

      await expect(
        service.cancelOrder('NK-ORD-20260808-1234', { reason: 'Changed my mind' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('requestReturn', () => {
    it('should allow return for DELIVERED order', async () => {
      const deliveredOrder = { ...mockOrder, orderStatus: OrderStatus.DELIVERED };
      ordersRepo.findByOrderNumber.mockResolvedValue(deliveredOrder as any);
      ordersRepo.updateStatus.mockResolvedValue({ ...deliveredOrder, orderStatus: OrderStatus.RETURNED } as any);

      const result = await service.requestReturn({
        orderId: 'NK-ORD-20260808-1234',
        reason: 'Product damaged',
      });
      expect(result.orderStatus).toBe(OrderStatus.RETURNED);
    });

    it('should reject return for non-DELIVERED order', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue(mockOrder as any); // CONFIRMED

      await expect(
        service.requestReturn({ orderId: 'NK-ORD-20260808-1234', reason: 'Test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyOrder', () => {
    it('should return order for the correct user', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue(mockOrder as any);

      const result = await service.getMyOrder('NK-ORD-20260808-1234', userId.toString());
      expect(result.orderNumber).toBe('NK-ORD-20260808-1234');
    });

    it('should throw ForbiddenException for wrong user', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue(mockOrder as any);
      const wrongUserId = new Types.ObjectId().toString();

      await expect(
        service.getMyOrder('NK-ORD-20260808-1234', wrongUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getOrderTracking', () => {
    it('should return tracking info', async () => {
      const trackedOrder = {
        ...mockOrder,
        shippingInfo: { method: 'STANDARD', fee: 0, trackingNumber: 'BL123', courierPartner: 'Delhivery' },
      };
      ordersRepo.findByOrderNumber.mockResolvedValue(trackedOrder as any);

      const result = await service.getOrderTracking('NK-ORD-20260808-1234');
      expect(result.shippingInfo.trackingNumber).toBe('BL123');
    });
  });

  describe('getMyOrders', () => {
    it('should return paginated list of customer orders', async () => {
      ordersRepo.findByUserIdOrGuestIdPaginated = jest.fn().mockResolvedValue({
        data: [mockOrder],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      } as any);

      const result = await service.getMyOrders(userId.toString());
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findAll (admin)', () => {
    it('should return paginated orders', async () => {
      ordersRepo.findAll.mockResolvedValue({ data: [mockOrder as any], total: 1, page: 1, limit: 10, totalPages: 1 });

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.total).toBe(1);
    });
  });
});
