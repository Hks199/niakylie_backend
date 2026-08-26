"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsService = void 0;
const common_1 = require("@nestjs/common");
const pages_repository_js_1 = require("./repositories/pages.repository.js");
const faqs_repository_js_1 = require("./repositories/faqs.repository.js");
const blogs_repository_js_1 = require("./repositories/blogs.repository.js");
const DEFAULT_PAGES = [
    {
        title: 'About Us',
        slug: 'about-us',
        content: '<h1>About NiaKylie Fashion</h1><p>NiaKylie is a premium luxury ethnic fashion brand offering handcrafted sarees, suits, lehengas, and designer wear.</p>',
        metaTitle: 'About Us - NiaKylie Fashion',
        metaDescription: 'Learn more about NiaKylie Fashion and our commitment to luxury ethnic craftsmanship.',
    },
    {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: '<h1>Privacy Policy</h1><p>Your privacy is important to us. Read our privacy policy to understand how we protect your personal information.</p>',
        metaTitle: 'Privacy Policy - NiaKylie Fashion',
        metaDescription: 'Read the privacy policy for NiaKylie online store.',
    },
    {
        title: 'Terms & Conditions',
        slug: 'terms-and-conditions',
        content: '<h1>Terms and Conditions</h1><p>Welcome to NiaKylie. By shopping with us, you agree to the following terms and conditions.</p>',
        metaTitle: 'Terms & Conditions - NiaKylie Fashion',
        metaDescription: 'Terms and conditions governing the use of NiaKylie e-commerce services.',
    },
    {
        title: 'Refund Policy',
        slug: 'refund-policy',
        content: '<h1>Refund & Cancellation Policy</h1><p>We accept returns and refunds within 7 days of delivery for eligible unused items in original packaging.</p>',
        metaTitle: 'Refund Policy - NiaKylie Fashion',
        metaDescription: 'Hassle-free return and refund policy for NiaKylie customers.',
    },
    {
        title: 'Shipping Policy',
        slug: 'shipping-policy',
        content: '<h1>Shipping & Delivery Policy</h1><p>We offer standard shipping across India (3-5 business days) and international worldwide shipping.</p>',
        metaTitle: 'Shipping Policy - NiaKylie Fashion',
        metaDescription: 'Details on shipping timelines, delivery charges, and courier partners.',
    },
];
let CmsService = class CmsService {
    pagesRepo;
    faqsRepo;
    blogsRepo;
    constructor(pagesRepo, faqsRepo, blogsRepo) {
        this.pagesRepo = pagesRepo;
        this.faqsRepo = faqsRepo;
        this.blogsRepo = blogsRepo;
    }
    async onModuleInit() {
        for (const page of DEFAULT_PAGES) {
            const existing = await this.pagesRepo.findBySlug(page.slug);
            if (!existing) {
                await this.pagesRepo.create({ ...page, isPublished: true });
            }
        }
    }
    async getPages() {
        return this.pagesRepo.findAllPublished();
    }
    async getPageBySlug(slug) {
        const page = await this.pagesRepo.findBySlug(slug);
        if (!page || !page.isPublished) {
            throw new common_1.NotFoundException(`Page '${slug}' not found`);
        }
        return page;
    }
    async createPage(dto) {
        const existing = await this.pagesRepo.findBySlug(dto.slug);
        if (existing) {
            throw new common_1.BadRequestException(`Page with slug '${dto.slug}' already exists`);
        }
        return this.pagesRepo.create(dto);
    }
    async updatePage(id, dto) {
        const page = await this.pagesRepo.findById(id);
        if (!page)
            throw new common_1.NotFoundException(`Page '${id}' not found`);
        if (dto.slug && dto.slug !== page.slug) {
            const existing = await this.pagesRepo.findBySlug(dto.slug);
            if (existing)
                throw new common_1.BadRequestException(`Slug '${dto.slug}' is already taken`);
        }
        const updated = await this.pagesRepo.update(id, dto);
        return updated;
    }
    async deletePage(id) {
        const page = await this.pagesRepo.findById(id);
        if (!page)
            throw new common_1.NotFoundException(`Page '${id}' not found`);
        await this.pagesRepo.softDelete(id);
        return { message: 'Page deleted successfully' };
    }
    async getFaqs() {
        return this.faqsRepo.findAllActiveGrouped();
    }
    async createFaq(dto) {
        return this.faqsRepo.create(dto);
    }
    async updateFaq(id, dto) {
        const faq = await this.faqsRepo.findById(id);
        if (!faq)
            throw new common_1.NotFoundException(`FAQ '${id}' not found`);
        const updated = await this.faqsRepo.update(id, dto);
        return updated;
    }
    async deleteFaq(id) {
        const faq = await this.faqsRepo.findById(id);
        if (!faq)
            throw new common_1.NotFoundException(`FAQ '${id}' not found`);
        await this.faqsRepo.softDelete(id);
        return { message: 'FAQ deleted successfully' };
    }
    async getBlogs(query) {
        return this.blogsRepo.findPublished(query);
    }
    async getBlogBySlug(slug) {
        const blog = await this.blogsRepo.findBySlug(slug);
        if (!blog || !blog.isPublished) {
            throw new common_1.NotFoundException(`Blog post '${slug}' not found`);
        }
        await this.blogsRepo.incrementViewCount(blog._id.toString());
        return blog;
    }
    async createBlog(dto) {
        const existing = await this.blogsRepo.findBySlug(dto.slug);
        if (existing) {
            throw new common_1.BadRequestException(`Blog post with slug '${dto.slug}' already exists`);
        }
        return this.blogsRepo.create(dto);
    }
    async updateBlog(id, dto) {
        const blog = await this.blogsRepo.findById(id);
        if (!blog)
            throw new common_1.NotFoundException(`Blog '${id}' not found`);
        if (dto.slug && dto.slug !== blog.slug) {
            const existing = await this.blogsRepo.findBySlug(dto.slug);
            if (existing)
                throw new common_1.BadRequestException(`Slug '${dto.slug}' is already taken`);
        }
        const updated = await this.blogsRepo.update(id, dto);
        return updated;
    }
    async deleteBlog(id) {
        const blog = await this.blogsRepo.findById(id);
        if (!blog)
            throw new common_1.NotFoundException(`Blog '${id}' not found`);
        await this.blogsRepo.softDelete(id);
        return { message: 'Blog post deleted successfully' };
    }
};
exports.CmsService = CmsService;
exports.CmsService = CmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pages_repository_js_1.PagesRepository,
        faqs_repository_js_1.FaqsRepository,
        blogs_repository_js_1.BlogsRepository])
], CmsService);
//# sourceMappingURL=cms.service.js.map