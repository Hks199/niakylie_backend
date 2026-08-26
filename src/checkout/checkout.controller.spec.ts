import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutController } from './checkout.controller.js';
import { CheckoutService } from './checkout.service.js';
import { PaymentMethod } from './schemas/order.schema.js';

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let service: jest.Mocked<CheckoutService>;

  const mockShippingAddress = {
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    phone: '+919876543210',
  };

  beforeEach(async () => {
    const mockService = {
      getCheckoutSummary: jest.fn(),
      validateCheckout: jest.fn(),
      placeOrder: jest.fn(),
      getOrderById: jest.fn(),
      getInvoice: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [{ provide: CheckoutService, useValue: mockService }],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
    service = module.get(CheckoutService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCheckoutSummary', () => {
    it('should delegate summary calculation to service', async () => {
      const mockSummary = { isCheckoutReady: true, pricing: { grandTotal: 2000 } };
      service.getCheckoutSummary.mockResolvedValue(mockSummary as any);

      const req = { user: { id: 'user123' } };
      const dto = {};
      const result = await controller.getCheckoutSummary(dto, req, undefined);

      expect(service.getCheckoutSummary).toHaveBeenCalledWith('user123', dto);
      expect(result).toBe(mockSummary);
    });
  });

  describe('placeOrder', () => {
    it('should delegate order placement to service', async () => {
      const mockOrder = { orderNumber: 'NK-ORD-123', grandTotal: 2000 };
      service.placeOrder.mockResolvedValue(mockOrder as any);

      const req = { user: { id: 'user123' } };
      const dto = {
        shippingAddress: mockShippingAddress,
        paymentMethod: PaymentMethod.COD,
      };

      const result = await controller.placeOrder(dto, req, undefined);

      expect(service.placeOrder).toHaveBeenCalledWith('user123', dto);
      expect(result).toBe(mockOrder);
    });
  });

  describe('getInvoice', () => {
    it('should return printable invoice from service', async () => {
      const mockInvoice = { invoiceNumber: 'NK-INV-123', htmlTemplate: '<html></html>' };
      service.getInvoice.mockResolvedValue(mockInvoice as any);

      const req = { user: { id: 'user123' } };
      const result = await controller.getInvoice('NK-ORD-123', req);

      expect(service.getInvoice).toHaveBeenCalledWith('NK-ORD-123', 'user123');
      expect(result).toBe(mockInvoice);
    });
  });
});
