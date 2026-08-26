import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { PaymentService } from './payment.service.js';
import { PaymentTransactionsRepository } from './repositories/payment-transactions.repository.js';
import { OrdersRepository } from '../checkout/repositories/orders.repository.js';
import { RazorpayService } from './providers/razorpay.service.js';
import { StripeService } from './providers/stripe.service.js';
import { PaymentProvider, TransactionStatus, PaymentType } from './schemas/payment-transaction.schema.js';
import { PaymentStatus, OrderStatus } from '../checkout/schemas/order.schema.js';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepo: jest.Mocked<PaymentTransactionsRepository>;
  let ordersRepo: jest.Mocked<OrdersRepository>;
  let razorpayService: jest.Mocked<RazorpayService>;
  let stripeService: jest.Mocked<StripeService>;

  const orderId = new Types.ObjectId('60d5ecb8b392d40015f8a001');
  const userId = new Types.ObjectId('60d5ecb8b392d40015f8a002');
  const txnId = new Types.ObjectId('60d5ecb8b392d40015f8a003');

  const mockOrder = {
    _id: orderId,
    orderNumber: 'NK-ORD-20260807-1234',
    pricing: { grandTotal: 1000 },
    paymentInfo: { status: PaymentStatus.PENDING },
    orderStatus: OrderStatus.CONFIRMED,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockTransaction = {
    _id: txnId,
    transactionId: 'TXN-20260807-1234',
    orderId,
    orderNumber: 'NK-ORD-20260807-1234',
    provider: PaymentProvider.RAZORPAY,
    providerOrderId: 'order_rzp_123',
    providerPaymentId: 'pay_rzp_123',
    amount: 1000,
    currency: 'INR',
    paymentType: PaymentType.FULL,
    status: TransactionStatus.INITIATED,
    totalRefundedAmount: 0,
    refunds: [],
  };

  beforeEach(async () => {
    const mockPaymentRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByTransactionId: jest.fn(),
      findByOrderId: jest.fn(),
      findByProviderOrderId: jest.fn(),
      updateStatus: jest.fn(),
      addRefundRecord: jest.fn(),
    };

    const mockOrdersRepo = {
      findById: jest.fn(),
      findByOrderNumber: jest.fn(),
    };

    const mockRazorpayService = {
      createOrder: jest.fn(),
      verifySignature: jest.fn(),
      processRefund: jest.fn(),
    };

    const mockStripeService = {
      createPaymentIntent: jest.fn(),
      verifyPaymentIntent: jest.fn(),
      processRefund: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PaymentTransactionsRepository, useValue: mockPaymentRepo },
        { provide: OrdersRepository, useValue: mockOrdersRepo },
        { provide: RazorpayService, useValue: mockRazorpayService },
        { provide: StripeService, useValue: mockStripeService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paymentRepo = module.get(PaymentTransactionsRepository);
    ordersRepo = module.get(OrdersRepository);
    razorpayService = module.get(RazorpayService);
    stripeService = module.get(StripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should throw NotFoundException if order is not found', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue(null);

      await expect(
        service.createPaymentIntent(userId.toString(), {
          orderId: 'INVALID',
          provider: PaymentProvider.RAZORPAY,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if order is already paid', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue({
        ...mockOrder,
        paymentInfo: { status: PaymentStatus.COMPLETED },
      } as any);

      await expect(
        service.createPaymentIntent(userId.toString(), {
          orderId: 'NK-ORD-20260807-1234',
          provider: PaymentProvider.RAZORPAY,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create Razorpay payment intent successfully', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue(mockOrder as any);
      razorpayService.createOrder.mockResolvedValue({ id: 'order_rzp_123' } as any);
      paymentRepo.create.mockResolvedValue({ ...mockTransaction, status: TransactionStatus.INITIATED } as any);

      const result = await service.createPaymentIntent(userId.toString(), {
        orderId: 'NK-ORD-20260807-1234',
        provider: PaymentProvider.RAZORPAY,
      });

      expect(razorpayService.createOrder).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'INR',
        receipt: 'NK-ORD-20260807-1234',
      });
      expect(result.providerOrderId).toBe('order_rzp_123');
    });

    it('should create Stripe payment intent successfully', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue(mockOrder as any);
      stripeService.createPaymentIntent.mockResolvedValue({
        id: 'pi_stripe_123',
        client_secret: 'pi_stripe_123_secret',
      } as any);
      paymentRepo.create.mockResolvedValue({ ...mockTransaction, provider: PaymentProvider.STRIPE } as any);

      const result = await service.createPaymentIntent(userId.toString(), {
        orderId: 'NK-ORD-20260807-1234',
        provider: PaymentProvider.STRIPE,
      });

      expect(stripeService.createPaymentIntent).toHaveBeenCalled();
      expect(result.clientSecret).toBe('pi_stripe_123_secret');
    });
  });

  describe('verifyRazorpayPayment', () => {
    it('should throw BadRequestException on invalid signature', async () => {
      razorpayService.verifySignature.mockReturnValue(false);

      await expect(
        service.verifyRazorpayPayment({
          razorpayOrderId: 'order_123',
          razorpayPaymentId: 'pay_123',
          razorpaySignature: 'invalid_sig',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should verify payment and update order status to COMPLETED', async () => {
      razorpayService.verifySignature.mockReturnValue(true);
      paymentRepo.findByProviderOrderId.mockResolvedValue(mockTransaction as any);
      paymentRepo.updateStatus.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.SUCCESS,
      } as any);
      ordersRepo.findById.mockResolvedValue(mockOrder as any);

      const result = await service.verifyRazorpayPayment({
        razorpayOrderId: 'order_rzp_123',
        razorpayPaymentId: 'pay_rzp_123',
        razorpaySignature: 'valid_sig',
      });

      expect(paymentRepo.updateStatus).toHaveBeenCalledWith(
        mockTransaction._id.toString(),
        TransactionStatus.SUCCESS,
        expect.any(Object),
      );
      expect(mockOrder.paymentInfo.status).toBe(PaymentStatus.COMPLETED);
    });
  });

  describe('processRefund', () => {
    it('should process full refund and update transaction and order', async () => {
      paymentRepo.findByTransactionId.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.SUCCESS,
        amount: 1000,
        totalRefundedAmount: 0,
      } as any);
      razorpayService.processRefund.mockResolvedValue({ id: 'rfnd_123' } as any);
      paymentRepo.addRefundRecord.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.REFUNDED,
      } as any);
      ordersRepo.findById.mockResolvedValue(mockOrder as any);

      const result = await service.processRefund({
        transactionId: 'TXN-20260807-1234',
        reason: 'Customer return',
      });

      expect(razorpayService.processRefund).toHaveBeenCalledWith({
        paymentId: 'pay_rzp_123',
        amount: 1000,
      });
      expect(mockOrder.paymentInfo.status).toBe(PaymentStatus.REFUNDED);
      expect(mockOrder.orderStatus).toBe(OrderStatus.CANCELLED);
    });
  });
});
