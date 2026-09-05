import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { PaymentTransactionsRepository } from './repositories/payment-transactions.repository.js';
import { OrdersRepository } from '../checkout/repositories/orders.repository.js';
import { RazorpayService } from './providers/razorpay.service.js';
import { StripeService } from './providers/stripe.service.js';

import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto.js';
import { VerifyRazorpayDto } from './dto/verify-razorpay.dto.js';
import { VerifyStripeDto } from './dto/verify-stripe.dto.js';
import { ProcessRefundDto } from './dto/process-refund.dto.js';
import { RetryPaymentDto } from './dto/retry-payment.dto.js';

import {
  PaymentTransactionDocument,
  PaymentProvider,
  TransactionStatus,
  PaymentType,
} from './schemas/payment-transaction.schema.js';

import { PaymentStatus, OrderStatus } from '../checkout/schemas/order.schema.js';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepo: PaymentTransactionsRepository,
    private readonly ordersRepo: OrdersRepository,
    private readonly razorpayService: RazorpayService,
    private readonly stripeService: StripeService,
  ) {}

  private generateTransactionId(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `TXN-${dateStr}-${randomSuffix}`;
  }

  async createPaymentIntent(
    userId?: string,
    dto?: CreatePaymentIntentDto,
  ): Promise<{
    transactionId: string;
    orderNumber: string;
    provider: PaymentProvider;
    amount: number;
    currency: string;
    status: TransactionStatus;
    providerOrderId?: string;
    clientSecret?: string;
    paymentType: PaymentType;
  }> {
    if (!dto) {
      throw new BadRequestException('Payment intent DTO is required');
    }

    let order = await this.ordersRepo.findByOrderNumber(dto.orderId);
    if (!order && Types.ObjectId.isValid(dto.orderId)) {
      order = await this.ordersRepo.findById(dto.orderId);
    }

    if (!order) {
      throw new NotFoundException(`Order '${dto.orderId}' not found`);
    }

    if (order.paymentInfo.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException(`Order '${order.orderNumber}' is already fully paid`);
    }

    const paymentType = dto.paymentType || PaymentType.FULL;
    const amountToPay =
      paymentType === PaymentType.PARTIAL && dto.partialAmount
        ? Math.min(dto.partialAmount, order.pricing.grandTotal)
        : order.pricing.grandTotal;

    const transactionId = this.generateTransactionId();
    let providerOrderId: string | undefined;
    let clientSecret: string | undefined;

    if (dto.provider === PaymentProvider.RAZORPAY) {
      const rzpOrder = await this.razorpayService.createOrder({
        amount: amountToPay,
        currency: 'INR',
        receipt: order.orderNumber,
      });
      providerOrderId = rzpOrder.id;
    } else if (dto.provider === PaymentProvider.STRIPE) {
      const stripeIntent = await this.stripeService.createPaymentIntent({
        amount: amountToPay,
        currency: 'inr',
        metadata: { orderNumber: order.orderNumber, transactionId },
      });
      providerOrderId = stripeIntent.id;
      clientSecret = stripeIntent.client_secret;
    }

    const transaction = await this.paymentRepo.create({
      transactionId,
      orderId: order._id as Types.ObjectId,
      orderNumber: order.orderNumber,
      userId: userId ? new Types.ObjectId(userId) : undefined,
      guestId: dto.guestId,
      provider: dto.provider,
      providerOrderId,
      amount: amountToPay,
      currency: 'INR',
      paymentType,
      status: dto.provider === PaymentProvider.COD ? TransactionStatus.SUCCESS : TransactionStatus.INITIATED,
    });

    return {
      transactionId: transaction.transactionId,
      orderNumber: order.orderNumber,
      provider: dto.provider,
      amount: amountToPay,
      currency: 'INR',
      status: transaction.status,
      providerOrderId,
      clientSecret,
      paymentType,
    };
  }

  async createRazorpayOrder(dto?: { amount?: number; orderId?: string }): Promise<{
    id: string;
    amount: number;
    currency: string;
    keyId: string;
  }> {
    const amount = dto?.amount || 0;
    const receipt = dto?.orderId || `receipt_${Date.now()}`;
    const rzpOrder = await this.razorpayService.createOrder({
      amount,
      currency: 'INR',
      receipt,
    });
    return {
      id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: this.razorpayService.getKeyId(),
    };
  }

  async createStripeIntent(dto?: { amount?: number; orderId?: string }): Promise<{
    clientSecret: string;
    intentId: string;
  }> {
    const amount = dto?.amount || 0;
    const stripeIntent = await this.stripeService.createPaymentIntent({
      amount,
      currency: 'inr',
      metadata: { orderId: dto?.orderId || '' },
    });
    return {
      clientSecret: stripeIntent.client_secret || `pi_mock_${Date.now()}_secret`,
      intentId: stripeIntent.id || `pi_mock_${Date.now()}`,
    };
  }

  async verifyRazorpayPayment(dto: VerifyRazorpayDto): Promise<PaymentTransactionDocument | { success: boolean }> {
    const razorpayOrderId = dto.razorpayOrderId || dto.razorpay_order_id || '';
    const razorpayPaymentId = dto.razorpayPaymentId || dto.razorpay_payment_id || '';
    const razorpaySignature = dto.razorpaySignature || dto.razorpay_signature || '';

    const isValid = this.razorpayService.verifySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid Razorpay payment signature');
    }

    if (razorpayOrderId) {
      const existingTransaction = await this.paymentRepo.findByProviderOrderId(razorpayOrderId);
      if (existingTransaction) {
        const updatedTxn = await this.paymentRepo.updateStatus(existingTransaction._id.toString(), TransactionStatus.SUCCESS, {
          providerPaymentId: razorpayPaymentId,
          signature: razorpaySignature,
        });

        const targetTxn = updatedTxn || existingTransaction;

        // Update order status
        const order = await this.ordersRepo.findById(targetTxn.orderId.toString());
        if (order) {
          order.paymentInfo.status = PaymentStatus.COMPLETED;
          order.paymentInfo.transactionId = razorpayPaymentId;
          order.paymentInfo.paidAt = new Date();
          order.orderStatus = OrderStatus.CONFIRMED;
          await order.save();
        }
        return targetTxn;
      }
    }

    return { success: true };
  }

  async verifyStripePayment(dto: VerifyStripeDto): Promise<PaymentTransactionDocument> {
    const verification = await this.stripeService.verifyPaymentIntent(dto.paymentIntentId);
    let transaction = await this.paymentRepo.findByProviderOrderId(dto.paymentIntentId);

    if (!transaction) {
      throw new NotFoundException(`Transaction for Stripe Intent '${dto.paymentIntentId}' not found`);
    }

    const newStatus = verification.status === 'succeeded' ? TransactionStatus.SUCCESS : TransactionStatus.FAILED;

    transaction = await this.paymentRepo.updateStatus(transaction._id.toString(), newStatus, {
      providerPaymentId: dto.paymentIntentId,
    });

    if (newStatus === TransactionStatus.SUCCESS) {
      const order = await this.ordersRepo.findById(transaction!.orderId.toString());
      if (order) {
        order.paymentInfo.status = PaymentStatus.COMPLETED;
        order.paymentInfo.transactionId = dto.paymentIntentId;
        order.paymentInfo.paidAt = new Date();
        order.orderStatus = OrderStatus.CONFIRMED;
        await order.save();
      }
    }

    return transaction!;
  }

  async handleRazorpayWebhook(payload: any, signature?: string): Promise<{ status: string }> {
    const event = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;

    if (event === 'payment.captured' && paymentEntity) {
      const providerOrderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const transaction = await this.paymentRepo.findByProviderOrderId(providerOrderId);
      if (transaction && transaction.status !== TransactionStatus.SUCCESS) {
        await this.paymentRepo.updateStatus(transaction._id.toString(), TransactionStatus.SUCCESS, {
          providerPaymentId: paymentId,
        });

        const order = await this.ordersRepo.findById(transaction.orderId.toString());
        if (order) {
          order.paymentInfo.status = PaymentStatus.COMPLETED;
          order.paymentInfo.transactionId = paymentId;
          order.paymentInfo.paidAt = new Date();
          await order.save();
        }
      }
    }

    return { status: 'acknowledged' };
  }

  async handleStripeWebhook(payload: any, signature?: string): Promise<{ status: string }> {
    const type = payload?.type;
    const dataObject = payload?.data?.object;

    if (type === 'payment_intent.succeeded' && dataObject) {
      const providerOrderId = dataObject.id;

      const transaction = await this.paymentRepo.findByProviderOrderId(providerOrderId);
      if (transaction && transaction.status !== TransactionStatus.SUCCESS) {
        await this.paymentRepo.updateStatus(transaction._id.toString(), TransactionStatus.SUCCESS, {
          providerPaymentId: providerOrderId,
        });

        const order = await this.ordersRepo.findById(transaction.orderId.toString());
        if (order) {
          order.paymentInfo.status = PaymentStatus.COMPLETED;
          order.paymentInfo.transactionId = providerOrderId;
          order.paymentInfo.paidAt = new Date();
          await order.save();
        }
      }
    }

    return { status: 'acknowledged' };
  }

  async processRefund(dto: ProcessRefundDto): Promise<PaymentTransactionDocument> {
    let transaction = await this.paymentRepo.findByTransactionId(dto.transactionId);
    if (!transaction) {
      const txns = await this.paymentRepo.findByOrderId(dto.transactionId);
      transaction = txns[0] || null;
    }

    if (!transaction) {
      throw new NotFoundException(`Transaction '${dto.transactionId}' not found`);
    }

    if (transaction.status !== TransactionStatus.SUCCESS && transaction.status !== TransactionStatus.PARTIALLY_REFUNDED) {
      throw new BadRequestException(`Cannot process refund for transaction with status '${transaction.status}'`);
    }

    const availableRefundable = transaction.amount - (transaction.totalRefundedAmount || 0);
    if (availableRefundable <= 0) {
      throw new BadRequestException('Transaction has already been fully refunded');
    }

    const refundAmount = dto.amount ? Math.min(dto.amount, availableRefundable) : availableRefundable;
    let providerRefundId = `rfnd_${Date.now()}`;

    if (transaction.provider === PaymentProvider.RAZORPAY && transaction.providerPaymentId) {
      const rzpRefund = await this.razorpayService.processRefund({
        paymentId: transaction.providerPaymentId,
        amount: refundAmount,
      });
      providerRefundId = rzpRefund.id;
    } else if (transaction.provider === PaymentProvider.STRIPE && transaction.providerOrderId) {
      const stripeRefund = await this.stripeService.processRefund({
        paymentIntentId: transaction.providerOrderId,
        amount: refundAmount,
      });
      providerRefundId = stripeRefund.id;
    }

    const isFullRefund = transaction.totalRefundedAmount + refundAmount >= transaction.amount;
    const newStatus = isFullRefund ? TransactionStatus.REFUNDED : TransactionStatus.PARTIALLY_REFUNDED;

    const refundRecord = {
      refundId: providerRefundId,
      amount: refundAmount,
      status: 'SUCCESS',
      reason: dto.reason || 'Customer refund request',
      createdAt: new Date(),
    };

    const updatedTxn = await this.paymentRepo.addRefundRecord(
      transaction._id.toString(),
      refundRecord,
      refundAmount,
      newStatus,
    );

    // Update Order payment status
    const order = await this.ordersRepo.findById(transaction.orderId.toString());
    if (order) {
      order.paymentInfo.status = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.COMPLETED;
      if (isFullRefund) {
        // Return flow: mark REFUNDED. Do not force CANCELLED on return refunds.
        if (
          order.orderStatus === OrderStatus.RETURNED ||
          order.orderStatus === OrderStatus.RETURN_REQUESTED
        ) {
          order.orderStatus = OrderStatus.REFUNDED;
        }
      }
      await order.save();
    }

    return updatedTxn!;
  }

  async retryPayment(userId?: string, dto?: RetryPaymentDto) {
    if (!dto) {
      throw new BadRequestException('Retry payment payload is required');
    }

    const order = await this.ordersRepo.findByOrderNumber(dto.orderId);
    if (!order) {
      throw new NotFoundException(`Order '${dto.orderId}' not found`);
    }

    return this.createPaymentIntent(userId, {
      orderId: order.orderNumber,
      provider: dto.provider,
      paymentType: PaymentType.FULL,
    });
  }

  async getTransaction(transactionId: string): Promise<PaymentTransactionDocument> {
    const txn = await this.paymentRepo.findByTransactionId(transactionId);
    if (!txn) {
      throw new NotFoundException(`Payment transaction '${transactionId}' not found`);
    }
    return txn;
  }

  async getOrderTransactions(orderId: string): Promise<PaymentTransactionDocument[]> {
    return this.paymentRepo.findByOrderId(orderId);
  }
}
