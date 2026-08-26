import { PaymentProvider, PaymentType } from '../schemas/payment-transaction.schema.js';
export declare class CreatePaymentIntentDto {
    orderId: string;
    provider: PaymentProvider;
    paymentType?: PaymentType;
    partialAmount?: number;
    guestId?: string;
}
