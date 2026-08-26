import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type InventoryHistoryDocument = InventoryHistory & Document;
export declare enum InventoryAdjustmentType {
    RESTOCK = "RESTOCK",
    MANUAL_ADJUSTMENT = "MANUAL_ADJUSTMENT",
    RESERVE = "RESERVE",
    RELEASE_RESERVATION = "RELEASE_RESERVATION",
    SALE_DEDUCTION = "SALE_DEDUCTION",
    RETURN_RESTOCK = "RETURN_RESTOCK",
    DAMAGE_LOSS = "DAMAGE_LOSS"
}
export declare class InventoryHistory {
    inventoryId: Types.ObjectId;
    productId: Types.ObjectId;
    sku: string;
    adjustmentType: InventoryAdjustmentType;
    previousStock: number;
    quantityChanged: number;
    newStock: number;
    previousReserved: number;
    newReserved: number;
    reason?: string;
    adjustedBy?: Types.ObjectId;
}
export declare const InventoryHistorySchema: MongooseSchema<InventoryHistory, import("mongoose").Model<InventoryHistory, any, any, any, any, any, InventoryHistory>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InventoryHistory, Document<unknown, {}, InventoryHistory, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<InventoryHistory & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    inventoryId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, InventoryHistory, Document<unknown, {}, InventoryHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    productId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, InventoryHistory, Document<unknown, {}, InventoryHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sku?: import("mongoose").SchemaDefinitionProperty<string, InventoryHistory, Document<unknown, {}, InventoryHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    adjustmentType?: import("mongoose").SchemaDefinitionProperty<InventoryAdjustmentType, InventoryHistory, Document<unknown, {}, InventoryHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    previousStock?: import("mongoose").SchemaDefinitionProperty<number, InventoryHistory, Document<unknown, {}, InventoryHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    quantityChanged?: import("mongoose").SchemaDefinitionProperty<number, InventoryHistory, Document<unknown, {}, InventoryHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    newStock?: import("mongoose").SchemaDefinitionProperty<number, InventoryHistory, Document<unknown, {}, InventoryHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    previousReserved?: import("mongoose").SchemaDefinitionProperty<number, InventoryHistory, Document<unknown, {}, InventoryHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    newReserved?: import("mongoose").SchemaDefinitionProperty<number, InventoryHistory, Document<unknown, {}, InventoryHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    reason?: import("mongoose").SchemaDefinitionProperty<string | undefined, InventoryHistory, Document<unknown, {}, InventoryHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    adjustedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, InventoryHistory, Document<unknown, {}, InventoryHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<InventoryHistory & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, InventoryHistory>;
