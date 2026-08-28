import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type CategoryDocument = Category & Document;
export declare class CategoryAncestor {
    _id: Types.ObjectId;
    name: string;
    slug: string;
}
export declare class Category {
    name: string;
    slug: string;
    parentId: Types.ObjectId | null;
    ancestors: CategoryAncestor[];
    description?: string;
    image?: string;
    banner?: string;
    status: boolean;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    displayOrder: number;
    isDeleted: boolean;
    deletedAt?: Date | null;
}
export declare const CategorySchema: MongooseSchema<Category, import("mongoose").Model<Category, any, any, any, any, any, Category>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Category, Document<unknown, {}, Category, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    slug?: import("mongoose").SchemaDefinitionProperty<string, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    parentId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | null, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    ancestors?: import("mongoose").SchemaDefinitionProperty<CategoryAncestor[], Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    description?: import("mongoose").SchemaDefinitionProperty<string | undefined, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    image?: import("mongoose").SchemaDefinitionProperty<string | undefined, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    banner?: import("mongoose").SchemaDefinitionProperty<string | undefined, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<boolean, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    seoTitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    seoDescription?: import("mongoose").SchemaDefinitionProperty<string | undefined, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    seoKeywords?: import("mongoose").SchemaDefinitionProperty<string[] | undefined, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    displayOrder?: import("mongoose").SchemaDefinitionProperty<number, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isDeleted?: import("mongoose").SchemaDefinitionProperty<boolean, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    deletedAt?: import("mongoose").SchemaDefinitionProperty<Date | null | undefined, Category, Document<unknown, {}, Category, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Category>;
