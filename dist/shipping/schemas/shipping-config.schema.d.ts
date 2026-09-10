import { Document } from 'mongoose';
export type ShippingConfigDocument = ShippingConfig & Document;
export declare class ShippingConfig {
    standardDeliveryFee: number;
    expressDeliveryFee: number;
    freeShippingThreshold: number;
}
export declare const ShippingConfigSchema: import("mongoose").Schema<ShippingConfig, import("mongoose").Model<ShippingConfig, any, any, any, any, any, ShippingConfig>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ShippingConfig, Document<unknown, {}, ShippingConfig, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ShippingConfig & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    standardDeliveryFee?: import("mongoose").SchemaDefinitionProperty<number, ShippingConfig, Document<unknown, {}, ShippingConfig, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ShippingConfig & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    expressDeliveryFee?: import("mongoose").SchemaDefinitionProperty<number, ShippingConfig, Document<unknown, {}, ShippingConfig, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ShippingConfig & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    freeShippingThreshold?: import("mongoose").SchemaDefinitionProperty<number, ShippingConfig, Document<unknown, {}, ShippingConfig, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ShippingConfig & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, ShippingConfig>;
