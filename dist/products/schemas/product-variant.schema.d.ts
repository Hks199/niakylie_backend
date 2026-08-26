import { Document, Types } from 'mongoose';
export type ProductVariantDocument = ProductVariant & Document;
export declare class ProductVariant {
    _id: Types.ObjectId;
    sku?: string;
    barcode?: string;
    color: string;
    colorHex?: string;
    size: string;
    stock: number;
    mrp: number;
    offerPrice: number;
    discount: number;
    images: string[];
    isActive: boolean;
}
export declare const ProductVariantSchema: import("mongoose").Schema<ProductVariant, import("mongoose").Model<ProductVariant, any, any, any, any, any, ProductVariant>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductVariant, Document<unknown, {}, ProductVariant, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    sku?: import("mongoose").SchemaDefinitionProperty<string | undefined, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    barcode?: import("mongoose").SchemaDefinitionProperty<string | undefined, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    color?: import("mongoose").SchemaDefinitionProperty<string, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    colorHex?: import("mongoose").SchemaDefinitionProperty<string | undefined, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    size?: import("mongoose").SchemaDefinitionProperty<string, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    stock?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    mrp?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    offerPrice?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    discount?: import("mongoose").SchemaDefinitionProperty<number, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    images?: import("mongoose").SchemaDefinitionProperty<string[], ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, ProductVariant, Document<unknown, {}, ProductVariant, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProductVariant & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, ProductVariant>;
