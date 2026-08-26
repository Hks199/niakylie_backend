import { Document } from 'mongoose';
export type PageDocument = Page & Document;
export declare class Page {
    title: string;
    slug: string;
    content: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords: string[];
    isPublished: boolean;
    isDeleted: boolean;
}
export declare const PageSchema: import("mongoose").Schema<Page, import("mongoose").Model<Page, any, any, any, any, any, Page>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Page, Document<unknown, {}, Page, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Page & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Page, Document<unknown, {}, Page, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Page & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    slug?: import("mongoose").SchemaDefinitionProperty<string, Page, Document<unknown, {}, Page, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Page & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, Page, Document<unknown, {}, Page, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Page & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metaTitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, Page, Document<unknown, {}, Page, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Page & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metaDescription?: import("mongoose").SchemaDefinitionProperty<string | undefined, Page, Document<unknown, {}, Page, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Page & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metaKeywords?: import("mongoose").SchemaDefinitionProperty<string[], Page, Document<unknown, {}, Page, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Page & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isPublished?: import("mongoose").SchemaDefinitionProperty<boolean, Page, Document<unknown, {}, Page, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Page & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isDeleted?: import("mongoose").SchemaDefinitionProperty<boolean, Page, Document<unknown, {}, Page, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Page & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Page>;
