import { PaymentService } from './payment.service.js';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto.js';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto.js';
import { CreateStripeIntentDto } from './dto/create-stripe-intent.dto.js';
import { VerifyRazorpayDto } from './dto/verify-razorpay.dto.js';
import { VerifyStripeDto } from './dto/verify-stripe.dto.js';
import { ProcessRefundDto } from './dto/process-refund.dto.js';
import { RetryPaymentDto } from './dto/retry-payment.dto.js';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createRazorpayOrder(dto: CreateRazorpayOrderDto): Promise<{
        id: string;
        amount: number;
        currency: string;
        keyId: string;
    }>;
    createStripeIntent(dto: CreateStripeIntentDto): Promise<{
        clientSecret: string;
        intentId: string;
    }>;
    createPaymentIntent(dto: CreatePaymentIntentDto, req: any, guestIdHeader?: string): Promise<{
        transactionId: string;
        orderNumber: string;
        provider: import("./schemas/payment-transaction.schema.js").PaymentProvider;
        amount: number;
        currency: string;
        status: import("./schemas/payment-transaction.schema.js").TransactionStatus;
        providerOrderId?: string;
        clientSecret?: string;
        paymentType: import("./schemas/payment-transaction.schema.js").PaymentType;
    }>;
    verifyRazorpayPayment(dto: VerifyRazorpayDto): Promise<import("./schemas/payment-transaction.schema.js").PaymentTransactionDocument | {
        success: boolean;
    }>;
    verifyStripePayment(dto: VerifyStripeDto): Promise<import("./schemas/payment-transaction.schema.js").PaymentTransactionDocument>;
    handleRazorpayWebhook(payload: any, signature?: string): Promise<{
        status: string;
    }>;
    handleStripeWebhook(payload: any, signature?: string): Promise<{
        status: string;
    }>;
    processRefund(dto: ProcessRefundDto): Promise<import("./schemas/payment-transaction.schema.js").PaymentTransactionDocument>;
    retryPayment(dto: RetryPaymentDto, req: any): Promise<{
        transactionId: string;
        orderNumber: string;
        provider: import("./schemas/payment-transaction.schema.js").PaymentProvider;
        amount: number;
        currency: string;
        status: import("./schemas/payment-transaction.schema.js").TransactionStatus;
        providerOrderId?: string;
        clientSecret?: string;
        paymentType: import("./schemas/payment-transaction.schema.js").PaymentType;
    }>;
    getTransaction(transactionId: string): Promise<import("./schemas/payment-transaction.schema.js").PaymentTransactionDocument>;
    getOrderTransactions(orderId: string): Promise<import("./schemas/payment-transaction.schema.js").PaymentTransactionDocument[]>;
}
