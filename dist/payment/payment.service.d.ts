import { PaymentTransactionsRepository } from './repositories/payment-transactions.repository.js';
import { OrdersRepository } from '../checkout/repositories/orders.repository.js';
import { RazorpayService } from './providers/razorpay.service.js';
import { StripeService } from './providers/stripe.service.js';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto.js';
import { VerifyRazorpayDto } from './dto/verify-razorpay.dto.js';
import { VerifyStripeDto } from './dto/verify-stripe.dto.js';
import { ProcessRefundDto } from './dto/process-refund.dto.js';
import { RetryPaymentDto } from './dto/retry-payment.dto.js';
import { PaymentTransactionDocument, PaymentProvider, TransactionStatus, PaymentType } from './schemas/payment-transaction.schema.js';
export declare class PaymentService {
    private readonly paymentRepo;
    private readonly ordersRepo;
    private readonly razorpayService;
    private readonly stripeService;
    constructor(paymentRepo: PaymentTransactionsRepository, ordersRepo: OrdersRepository, razorpayService: RazorpayService, stripeService: StripeService);
    private generateTransactionId;
    createPaymentIntent(userId?: string, dto?: CreatePaymentIntentDto): Promise<{
        transactionId: string;
        orderNumber: string;
        provider: PaymentProvider;
        amount: number;
        currency: string;
        status: TransactionStatus;
        providerOrderId?: string;
        clientSecret?: string;
        paymentType: PaymentType;
    }>;
    verifyRazorpayPayment(dto: VerifyRazorpayDto): Promise<PaymentTransactionDocument>;
    verifyStripePayment(dto: VerifyStripeDto): Promise<PaymentTransactionDocument>;
    handleRazorpayWebhook(payload: any, signature?: string): Promise<{
        status: string;
    }>;
    handleStripeWebhook(payload: any, signature?: string): Promise<{
        status: string;
    }>;
    processRefund(dto: ProcessRefundDto): Promise<PaymentTransactionDocument>;
    retryPayment(userId?: string, dto?: RetryPaymentDto): Promise<{
        transactionId: string;
        orderNumber: string;
        provider: PaymentProvider;
        amount: number;
        currency: string;
        status: TransactionStatus;
        providerOrderId?: string;
        clientSecret?: string;
        paymentType: PaymentType;
    }>;
    getTransaction(transactionId: string): Promise<PaymentTransactionDocument>;
    getOrderTransactions(orderId: string): Promise<PaymentTransactionDocument[]>;
}
