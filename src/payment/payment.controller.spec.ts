import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller.js';
import { PaymentService } from './payment.service.js';
import { OnlinePaymentDiscountService } from './online-payment-discount.service.js';
import { PaymentProvider } from './schemas/payment-transaction.schema.js';

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: jest.Mocked<PaymentService>;

  beforeEach(async () => {
    const mockService = {
      createPaymentIntent: jest.fn(),
      verifyRazorpayPayment: jest.fn(),
      verifyStripePayment: jest.fn(),
      handleRazorpayWebhook: jest.fn(),
      handleStripeWebhook: jest.fn(),
      processRefund: jest.fn(),
      retryPayment: jest.fn(),
      getTransaction: jest.fn(),
      getOrderTransactions: jest.fn(),
    };

    const mockOnlineDiscountService = {
      getConfig: jest.fn(),
      updateConfig: jest.fn(),
      calculateDiscount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: PaymentService, useValue: mockService },
        { provide: OnlinePaymentDiscountService, useValue: mockOnlineDiscountService },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get(PaymentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should delegate intent creation to service', async () => {
      const mockResult = { transactionId: 'TXN-123', provider: PaymentProvider.RAZORPAY };
      service.createPaymentIntent.mockResolvedValue(mockResult as any);

      const req = { user: { id: 'user123' } };
      const dto = { orderId: 'NK-ORD-123', provider: PaymentProvider.RAZORPAY };

      const result = await controller.createPaymentIntent(dto, req, undefined);

      expect(service.createPaymentIntent).toHaveBeenCalledWith('user123', dto);
      expect(result).toBe(mockResult);
    });
  });

  describe('verifyRazorpayPayment', () => {
    it('should delegate Razorpay verification to service', async () => {
      const mockTxn = { transactionId: 'TXN-123', status: 'SUCCESS' };
      service.verifyRazorpayPayment.mockResolvedValue(mockTxn as any);

      const dto = {
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_123',
        razorpaySignature: 'sig_123',
      };

      const result = await controller.verifyRazorpayPayment(dto);

      expect(service.verifyRazorpayPayment).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockTxn);
    });
  });

  describe('processRefund', () => {
    it('should delegate refund processing to service', async () => {
      const mockTxn = { transactionId: 'TXN-123', status: 'REFUNDED' };
      service.processRefund.mockResolvedValue(mockTxn as any);

      const dto = { transactionId: 'TXN-123', amount: 500 };
      const result = await controller.processRefund(dto);

      expect(service.processRefund).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockTxn);
    });
  });
});
