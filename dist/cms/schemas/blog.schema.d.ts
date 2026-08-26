import { Document } from 'mongoose';
export type BlogDocument = Blog & Document;
export declare class Blog {
    title: string;
    slug: string;
    content: string;
    summary?: string;
    coverImage?: string;
    author: string;
    category: string;
    tags: string[];
    viewCount: number;
    isPublished: boolean;
    publishedAt: Date;
    metaTitle?: string;
    metaDescription?: string;
    isDeleted: boolean;
}
export declare const BlogSchema: import("mongoose").Schema<Blog, import("mongoose").Model<Blog, any, any, any, any, any, Blog>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Blog, Document<unknown, {}, Blog, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & import("mongoose").HydratedDocumentOverrides<{
    id: string;
}>, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    slug?: import("mongoose").SchemaDefinitionProperty<string, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    summary?: import("mongoose").SchemaDefinitionProperty<string | undefined, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    coverImage?: import("mongoose").SchemaDefinitionProperty<string | undefined, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    author?: import("mongoose").SchemaDefinitionProperty<string, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    category?: import("mongoose").SchemaDefinitionProperty<string, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    tags?: import("mongoose").SchemaDefinitionProperty<string[], Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    viewCount?: import("mongoose").SchemaDefinitionProperty<number, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isPublished?: import("mongoose").SchemaDefinitionProperty<boolean, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    publishedAt?: import("mongoose").SchemaDefinitionProperty<Date, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metaTitle?: import("mongoose").SchemaDefinitionProperty<string | undefined, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    metaDescription?: import("mongoose").SchemaDefinitionProperty<string | undefined, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
    isDeleted?: import("mongoose").SchemaDefinitionProperty<boolean, Blog, Document<unknown, {}, Blog, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Blog & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & import("mongoose").HydratedDocumentOverrides<{
        id: string;
    }>> | undefined;
}, Blog>;
