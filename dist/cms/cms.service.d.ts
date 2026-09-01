import { OnModuleInit } from '@nestjs/common';
import { PagesRepository } from './repositories/pages.repository.js';
import { FaqsRepository } from './repositories/faqs.repository.js';
import { BlogsRepository } from './repositories/blogs.repository.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';
import { CreateFaqDto } from './dto/create-faq.dto.js';
import { UpdateFaqDto } from './dto/update-faq.dto.js';
import { CreateBlogDto } from './dto/create-blog.dto.js';
import { UpdateBlogDto } from './dto/update-blog.dto.js';
import { QueryBlogDto } from './dto/query-blog.dto.js';
import { PageDocument } from './schemas/page.schema.js';
import { FaqDocument } from './schemas/faq.schema.js';
import { BlogDocument } from './schemas/blog.schema.js';
export declare class CmsService implements OnModuleInit {
    private readonly pagesRepo;
    private readonly faqsRepo;
    private readonly blogsRepo;
    constructor(pagesRepo: PagesRepository, faqsRepo: FaqsRepository, blogsRepo: BlogsRepository);
    onModuleInit(): Promise<void>;
    getPages(): Promise<PageDocument[]>;
    getPageBySlug(slug: string): Promise<PageDocument>;
    createPage(dto: CreatePageDto): Promise<PageDocument>;
    updatePage(id: string, dto: UpdatePageDto): Promise<PageDocument>;
    deletePage(id: string): Promise<{
        message: string;
    }>;
    getFaqs(): Promise<Record<string, FaqDocument[]>>;
    getFaqsAdmin(): Promise<FaqDocument[]>;
    createFaq(dto: CreateFaqDto): Promise<FaqDocument>;
    updateFaq(id: string, dto: UpdateFaqDto): Promise<FaqDocument>;
    deleteFaq(id: string): Promise<{
        message: string;
    }>;
    getBlogs(query: QueryBlogDto): Promise<{
        data: BlogDocument[];
        total: number;
        page: number;
        limit: number;
    }>;
    getBlogBySlug(slug: string): Promise<BlogDocument>;
    createBlog(dto: CreateBlogDto): Promise<BlogDocument>;
    updateBlog(id: string, dto: UpdateBlogDto): Promise<BlogDocument>;
    deleteBlog(id: string): Promise<{
        message: string;
    }>;
}
