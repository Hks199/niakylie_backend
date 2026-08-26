import { Model } from 'mongoose';
import { PaymentTransaction, PaymentTransactionDocument, TransactionStatus, RefundRecord } from '../schemas/payment-transaction.schema.js';
export declare class PaymentTransactionsRepository {
    private readonly transactionModel;
    constructor(transactionModel: Model<PaymentTransactionDocument>);
    create(data: Partial<PaymentTransaction>): Promise<PaymentTransactionDocument>;
    findById(id: string): Promise<PaymentTransactionDocument | null>;
    findByTransactionId(transactionId: string): Promise<PaymentTransactionDocument | null>;
    findByOrderId(orderId: string): Promise<PaymentTransactionDocument[]>;
    findByProviderOrderId(providerOrderId: string): Promise<PaymentTransactionDocument | null>;
    updateStatus(id: string, status: TransactionStatus, extraData?: Partial<PaymentTransaction>): Promise<PaymentTransactionDocument | null>;
    addRefundRecord(id: string, refundRecord: RefundRecord, refundedAmount: number, newStatus: TransactionStatus): Promise<PaymentTransactionDocument | null>;
}
