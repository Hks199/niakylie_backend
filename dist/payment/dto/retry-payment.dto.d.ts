import { PaymentProvider } from '../schemas/payment-transaction.schema.js';
export declare class RetryPaymentDto {
    orderId: string;
    provider: PaymentProvider;
}
