import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type PaymentTransactionDocument = PaymentTransaction & Document;
export declare enum PaymentProvider {
    RAZORPAY = "RAZORPAY",
    STRIPE = "STRIPE",
    COD = "COD",
    WALLET = "WALLET"
}
export declare enum TransactionStatus {
    INITIATED = "INITIATED",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"
}
export declare enum PaymentType {
    FULL = "FULL",
    PARTIAL = "PARTIAL"
}
export declare class RefundRecord {
    refundId: string;
    amount: number;
    status: string;
    reason?: string;
    createdAt: Date;
}
export declare const RefundRecordSchema: MongooseSchema<RefundRecord, import("mongoose").Model<RefundRecord, any, any, any, any, any, RefundRecord>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RefundRecord, Document<unknown, {}, RefundRecord, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<RefundRecord & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    refundId?: import("mongoose").SchemaDefinitionProperty<string, RefundRecord, Document<unknown, {}, RefundRecord, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RefundRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, RefundRecord, Document<unknown, {}, RefundRecord, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RefundRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, RefundRecord, Document<unknown, {}, RefundRecord, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RefundRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    reason?: import("mongoose").SchemaDefinitionProperty<string | undefined, RefundRecord, Document<unknown, {}, RefundRecord, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RefundRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    createdAt?: import("mongoose").SchemaDefinitionProperty<Date, RefundRecord, Document<unknown, {}, RefundRecord, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<RefundRecord & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, RefundRecord>;
export declare class PaymentTransaction {
    transactionId: string;
    orderId: Types.ObjectId;
    orderNumber: string;
    userId?: Types.ObjectId;
    guestId?: string;
    provider: PaymentProvider;
    providerOrderId?: string;
    providerPaymentId?: string;
    amount: number;
    currency: string;
    paymentType: PaymentType;
    status: TransactionStatus;
    signature?: string;
    refunds: RefundRecord[];
    totalRefundedAmount: number;
    failureReason?: string;
    metadata?: Record<string, any>;
    isDeleted: boolean;
}
export declare const PaymentTransactionSchema: MongooseSchema<PaymentTransaction, import("mongoose").Model<PaymentTransaction, any, any, any, any, any, PaymentTransaction>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    transactionId?: import("mongoose").SchemaDefinitionProperty<string, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    orderId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    orderNumber?: import("mongoose").SchemaDefinitionProperty<string, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    guestId?: import("mongoose").SchemaDefinitionProperty<string | undefined, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    provider?: import("mongoose").SchemaDefinitionProperty<PaymentProvider, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    providerOrderId?: import("mongoose").SchemaDefinitionProperty<string | undefined, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    providerPaymentId?: import("mongoose").SchemaDefinitionProperty<string | undefined, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    currency?: import("mongoose").SchemaDefinitionProperty<string, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    paymentType?: import("mongoose").SchemaDefinitionProperty<PaymentType, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<TransactionStatus, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    signature?: import("mongoose").SchemaDefinitionProperty<string | undefined, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    refunds?: import("mongoose").SchemaDefinitionProperty<RefundRecord[], PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    totalRefundedAmount?: import("mongoose").SchemaDefinitionProperty<number, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    failureReason?: import("mongoose").SchemaDefinitionProperty<string | undefined, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metadata?: import("mongoose").SchemaDefinitionProperty<Record<string, any> | undefined, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isDeleted?: import("mongoose").SchemaDefinitionProperty<boolean, PaymentTransaction, Document<unknown, {}, PaymentTransaction, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<PaymentTransaction & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, PaymentTransaction>;
