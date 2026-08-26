import { Document } from 'mongoose';
export type BrandDocument = Brand & Document;
export declare class Brand {
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    status: boolean;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords: string[];
    isDeleted: boolean;
    deletedAt: Date | null;
}
export declare const BrandSchema: import("mongoose").Schema<Brand, import("mongoose").Model<Brand, any, any, any, any, any, Brand>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Brand, Document<unknown, {}, Brand, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Brand & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Brand, Document<unknown, {}, Brand, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Brand & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    slug?: import("mongoose").SchemaDefinitionProperty<string, Brand, Document<unknown, {}, Brand, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Brand & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    logo?: import("mongoose").SchemaDefinitionProperty<string | undefined, Brand, Document<unknown, {}, Brand, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Brand & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string | undefined, Brand, Document<unknown, {}, Brand, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Brand & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<boolean, Brand, Document<unknown, {}, Brand, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Brand & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    seoTitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, Brand, Document<unknown, {}, Brand, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Brand & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    seoDescription?: import("mongoose").SchemaDefinitionProperty<string | undefined, Brand, Document<unknown, {}, Brand, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Brand & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    seoKeywords?: import("mongoose").SchemaDefinitionProperty<string[], Brand, Document<unknown, {}, Brand, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Brand & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isDeleted?: import("mongoose").SchemaDefinitionProperty<boolean, Brand, Document<unknown, {}, Brand, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Brand & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    deletedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Brand, Document<unknown, {}, Brand, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Brand & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Brand>;
