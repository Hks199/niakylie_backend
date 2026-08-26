import { Document } from 'mongoose';
export type FaqDocument = Faq & Document;
export declare class Faq {
    question: string;
    answer: string;
    category: string;
    displayOrder: number;
    isActive: boolean;
    isDeleted: boolean;
}
export declare const FaqSchema: import("mongoose").Schema<Faq, import("mongoose").Model<Faq, any, any, any, any, any, Faq>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Faq, Document<unknown, {}, Faq, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    question?: import("mongoose").SchemaDefinitionProperty<string, Faq, Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    answer?: import("mongoose").SchemaDefinitionProperty<string, Faq, Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    category?: import("mongoose").SchemaDefinitionProperty<string, Faq, Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    displayOrder?: import("mongoose").SchemaDefinitionProperty<number, Faq, Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Faq, Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isDeleted?: import("mongoose").SchemaDefinitionProperty<boolean, Faq, Document<unknown, {}, Faq, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Faq & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Faq>;
