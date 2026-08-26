import { PaymentService } from './payment.service.js';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto.js';
import { VerifyRazorpayDto } from './dto/verify-razorpay.dto.js';
import { VerifyStripeDto } from './dto/verify-stripe.dto.js';
import { ProcessRefundDto } from './dto/process-refund.dto.js';
import { RetryPaymentDto } from './dto/retry-payment.dto.js';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
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
    verifyRazorpayPayment(dto: VerifyRazorpayDto): Promise<import("./schemas/payment-transaction.schema.js").PaymentTransactionDocument>;
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
