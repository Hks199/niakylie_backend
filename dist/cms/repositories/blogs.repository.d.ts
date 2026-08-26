import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../schemas/blog.schema.js';
import { QueryBlogDto } from '../dto/query-blog.dto.js';
export declare class BlogsRepository {
    private readonly blogModel;
    constructor(blogModel: Model<BlogDocument>);
    create(data: Partial<Blog>): Promise<BlogDocument>;
    findById(id: string): Promise<BlogDocument | null>;
    findBySlug(slug: string): Promise<BlogDocument | null>;
    findPublished(query: QueryBlogDto): Promise<{
        data: BlogDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    incrementViewCount(id: string): Promise<void>;
    update(id: string, updateData: Partial<Blog>): Promise<BlogDocument | null>;
    softDelete(id: string): Promise<BlogDocument | null>;
}
