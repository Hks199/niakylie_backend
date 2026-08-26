import { CmsService } from './cms.service.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';
import { CreateFaqDto } from './dto/create-faq.dto.js';
import { UpdateFaqDto } from './dto/update-faq.dto.js';
import { CreateBlogDto } from './dto/create-blog.dto.js';
import { UpdateBlogDto } from './dto/update-blog.dto.js';
import { QueryBlogDto } from './dto/query-blog.dto.js';
export declare class CmsController {
    private readonly cmsService;
    constructor(cmsService: CmsService);
    getPages(): Promise<import("./schemas/page.schema.js").PageDocument[]>;
    getPageBySlug(slug: string): Promise<import("./schemas/page.schema.js").PageDocument>;
    getFaqs(): Promise<Record<string, import("./schemas/faq.schema.js").FaqDocument[]>>;
    getBlogs(query: QueryBlogDto): Promise<{
        data: import("./schemas/blog.schema.js").BlogDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    getBlogBySlug(slug: string): Promise<import("./schemas/blog.schema.js").BlogDocument>;
    createPage(dto: CreatePageDto): Promise<import("./schemas/page.schema.js").PageDocument>;
    updatePage(id: string, dto: UpdatePageDto): Promise<import("./schemas/page.schema.js").PageDocument>;
    deletePage(id: string): Promise<{
        message: string;
    }>;
    createFaq(dto: CreateFaqDto): Promise<import("./schemas/faq.schema.js").FaqDocument>;
    updateFaq(id: string, dto: UpdateFaqDto): Promise<import("./schemas/faq.schema.js").FaqDocument>;
    deleteFaq(id: string): Promise<{
        message: string;
    }>;
    createBlog(dto: CreateBlogDto): Promise<import("./schemas/blog.schema.js").BlogDocument>;
    updateBlog(id: string, dto: UpdateBlogDto): Promise<import("./schemas/blog.schema.js").BlogDocument>;
    deleteBlog(id: string): Promise<{
        message: string;
    }>;
}
