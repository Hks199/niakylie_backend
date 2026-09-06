import { Document } from 'mongoose';
export type OnlinePaymentDiscountDocument = OnlinePaymentDiscount & Document;
export declare enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    FLAT = "FLAT"
}
export declare class OnlinePaymentDiscount {
    isEnabled: boolean;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount: number;
    maxDiscountCap: number;
    badgeText: string;
    description: string;
}
export declare const OnlinePaymentDiscountSchema: import("mongoose").Schema<OnlinePaymentDiscount, import("mongoose").Model<OnlinePaymentDiscount, any, any, any, any, any, OnlinePaymentDiscount>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OnlinePaymentDiscount, Document<unknown, {}, OnlinePaymentDiscount, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<OnlinePaymentDiscount & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    isEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, OnlinePaymentDiscount, Document<unknown, {}, OnlinePaymentDiscount, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OnlinePaymentDiscount & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    discountType?: import("mongoose").SchemaDefinitionProperty<DiscountType, OnlinePaymentDiscount, Document<unknown, {}, OnlinePaymentDiscount, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OnlinePaymentDiscount & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    discountValue?: import("mongoose").SchemaDefinitionProperty<number, OnlinePaymentDiscount, Document<unknown, {}, OnlinePaymentDiscount, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OnlinePaymentDiscount & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    minOrderAmount?: import("mongoose").SchemaDefinitionProperty<number, OnlinePaymentDiscount, Document<unknown, {}, OnlinePaymentDiscount, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OnlinePaymentDiscount & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    maxDiscountCap?: import("mongoose").SchemaDefinitionProperty<number, OnlinePaymentDiscount, Document<unknown, {}, OnlinePaymentDiscount, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OnlinePaymentDiscount & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    badgeText?: import("mongoose").SchemaDefinitionProperty<string, OnlinePaymentDiscount, Document<unknown, {}, OnlinePaymentDiscount, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OnlinePaymentDiscount & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string, OnlinePaymentDiscount, Document<unknown, {}, OnlinePaymentDiscount, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<OnlinePaymentDiscount & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, OnlinePaymentDiscount>;
