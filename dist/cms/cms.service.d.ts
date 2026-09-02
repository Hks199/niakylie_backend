import { OnModuleInit } from '@nestjs/common';
import { PagesRepository } from './repositories/pages.repository.js';
import { FaqsRepository } from './repositories/faqs.repository.js';
import { BlogsRepository } from './repositories/blogs.repository.js';
import { SubscribersRepository } from './repositories/subscribers.repository.js';
import { CreatePageDto } from './dto/create-page.dto.js';
import { UpdatePageDto } from './dto/update-page.dto.js';
import { CreateFaqDto } from './dto/create-faq.dto.js';
import { UpdateFaqDto } from './dto/update-faq.dto.js';
import { CreateBlogDto } from './dto/create-blog.dto.js';
import { UpdateBlogDto } from './dto/update-blog.dto.js';
import { QueryBlogDto } from './dto/query-blog.dto.js';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto.js';
import { PageDocument } from './schemas/page.schema.js';
import { FaqDocument } from './schemas/faq.schema.js';
import { BlogDocument } from './schemas/blog.schema.js';
import { SubscriberDocument } from './schemas/subscriber.schema.js';
export declare class CmsService implements OnModuleInit {
    private readonly pagesRepo;
    private readonly faqsRepo;
    private readonly blogsRepo;
    private readonly subscribersRepo;
    constructor(pagesRepo: PagesRepository, faqsRepo: FaqsRepository, blogsRepo: BlogsRepository, subscribersRepo: SubscribersRepository);
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
    subscribeNewsletter(dto: SubscribeNewsletterDto): Promise<{
        message: string;
        subscriber: SubscriberDocument;
    }>;
    getSubscribers(query: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        subscribers: (import("mongoose").Document<unknown, {}, SubscriberDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/subscriber.schema.js").Subscriber & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    deleteSubscriber(id: string): Promise<{
        message: string;
    }>;
}
