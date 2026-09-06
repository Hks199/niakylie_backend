import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { OrderStatus } from '../checkout/schemas/order.schema.js';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;

  const mockOrder = { orderNumber: 'NK-ORD-20260808-1234', orderStatus: OrderStatus.CONFIRMED };

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      updateTracking: jest.fn(),
      approveReturn: jest.fn(),
      markRefunded: jest.fn(),
      getMyOrders: jest.fn(),
      getMyOrder: jest.fn(),
      getOrderTimeline: jest.fn(),
      getOrderTracking: jest.fn(),
      getInvoice: jest.fn(),
      cancelOrder: jest.fn(),
      requestReturn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateStatus', () => {
    it('should delegate status update to service', async () => {
      service.updateStatus.mockResolvedValue({ ...mockOrder, orderStatus: OrderStatus.PACKED } as any);

      const result = await controller.updateStatus('NK-ORD-20260808-1234', { status: OrderStatus.PACKED });
      expect(service.updateStatus).toHaveBeenCalledWith('NK-ORD-20260808-1234', { status: OrderStatus.PACKED });
      expect(result.orderStatus).toBe(OrderStatus.PACKED);
    });
  });

  describe('cancelOrder', () => {
    it('should delegate cancellation to service', async () => {
      service.cancelOrder.mockResolvedValue({ ...mockOrder, orderStatus: OrderStatus.CANCELLED } as any);
      const req = { user: { id: 'user123' } };

      const result = await controller.cancelOrder('NK-ORD-20260808-1234', { reason: 'Changed mind' }, req);
      expect(service.cancelOrder).toHaveBeenCalledWith('NK-ORD-20260808-1234', { reason: 'Changed mind' }, 'user123');
    });
  });

  describe('getMyOrders', () => {
    it('should return customer orders', async () => {
      service.getMyOrders.mockResolvedValue({
        data: [mockOrder],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      } as any);
      const req = { user: { id: 'user123' } };

      const result = await controller.getMyOrders(req, {});
      expect(service.getMyOrders).toHaveBeenCalledWith('user123', undefined, undefined, {
        page: undefined,
        limit: undefined,
      });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getInvoice', () => {
    it('should return invoice from service', async () => {
      const mockInvoice = { invoiceNumber: 'NK-INV-2026-1234', htmlTemplate: '<html></html>' };
      service.getInvoice.mockResolvedValue(mockInvoice as any);
      const req = { user: { id: 'user123' } };

      const result = await controller.getInvoice('NK-ORD-20260808-1234', req);
      expect(service.getInvoice).toHaveBeenCalledWith('NK-ORD-20260808-1234', 'user123');
      expect(result.invoiceNumber).toBe('NK-INV-2026-1234');
    });
  });
});
