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
const subscribers_repository_js_1 = require("./repositories/subscribers.repository.js");
const DEFAULT_PAGES = [
    {
        title: 'About Us',
        slug: 'about-us',
        content: '<h1>About Niakylie Women Collection</h1><p>NiaKylie is a premium luxury ethnic fashion brand offering handcrafted sarees, suits, lehengas, and designer wear.</p>',
        metaTitle: 'About Us - Niakylie Women Collection',
        metaDescription: 'Learn more about Niakylie Women Collection and our commitment to luxury ethnic craftsmanship.',
    },
    {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: '<h1>Privacy Policy</h1><p>Your privacy is important to us. Read our privacy policy to understand how we protect your personal information.</p>',
        metaTitle: 'Privacy Policy - Niakylie Women Collection',
        metaDescription: 'Read the privacy policy for NiaKylie online store.',
    },
    {
        title: 'Terms & Conditions',
        slug: 'terms-and-conditions',
        content: '<h1>Terms and Conditions</h1><p>Welcome to NiaKylie. By shopping with us, you agree to the following terms and conditions.</p>',
        metaTitle: 'Terms & Conditions - Niakylie Women Collection',
        metaDescription: 'Terms and conditions governing the use of NiaKylie e-commerce services.',
    },
    {
        title: 'Refund Policy',
        slug: 'refund-policy',
        content: '<h1>Refund & Cancellation Policy</h1><p>We accept returns and refunds within 7 days of delivery for eligible unused items in original packaging.</p>',
        metaTitle: 'Refund Policy - Niakylie Women Collection',
        metaDescription: 'Hassle-free return and refund policy for NiaKylie customers.',
    },
    {
        title: 'Shipping Policy',
        slug: 'shipping-policy',
        content: '<h1>Shipping & Delivery Policy</h1><p>We offer standard shipping across India (3-5 business days) and international worldwide shipping.</p>',
        metaTitle: 'Shipping Policy - Niakylie Women Collection',
        metaDescription: 'Details on shipping timelines, delivery charges, and courier partners.',
    },
];
const DEFAULT_FAQS = [
    {
        category: 'General',
        question: 'What makes NiaKylie sarees and ethnic wear authentic?',
        answer: 'Every NiaKylie garment carries a QR-coded Certificate of Authenticity, verifiable on our platform, guaranteeing genuine handloom or handcrafted origin directly from registered artisan weavers.',
        displayOrder: 1,
        isActive: true,
    },
    {
        category: 'General',
        question: 'How do I choose the correct size for custom garments?',
        answer: 'Visit our Size Guide available on every product details page for comprehensive bust, waist, and hip measurements. We also offer custom tailoring assistance via WhatsApp support.',
        displayOrder: 2,
        isActive: true,
    },
    {
        category: 'Orders',
        question: 'Can I modify or cancel my order after placing it?',
        answer: 'Orders can be cancelled or modified within 2 hours of placement. Navigate to My Account → My Orders and select "Cancel Order". After 2 hours, orders enter weaving/fulfillment and cannot be modified.',
        displayOrder: 1,
        isActive: true,
    },
    {
        category: 'Orders',
        question: 'Where can I track my live order status?',
        answer: 'Log in to your account, visit My Orders, and click "View Details" on any active order to see real-time courier dispatch status and shipment tracking links.',
        displayOrder: 2,
        isActive: true,
    },
    {
        category: 'Shipping',
        question: 'How long does standard shipping take across India?',
        answer: 'Standard shipping takes 5-7 business days across India and is completely FREE for orders above ₹999. Express delivery (1-2 business days) is available at checkout for ₹149.',
        displayOrder: 1,
        isActive: true,
    },
    {
        category: 'Shipping',
        question: 'Do you offer international worldwide shipping?',
        answer: 'We currently ship throughout India. International shipping to the USA, UK, UAE, Canada, and Australia is scheduled to launch in Q4 2026.',
        displayOrder: 2,
        isActive: true,
    },
    {
        category: 'Returns',
        question: 'What is your return & exchange policy?',
        answer: 'We offer a 7-day hassle-free return window for unworn, unaltered products with original tags. Initiate your return from My Account → My Orders.',
        displayOrder: 1,
        isActive: true,
    },
    {
        category: 'Returns',
        question: 'Are sale items or customized blouses eligible for return?',
        answer: 'Customized stitching (altered measurements) and clearance/sale items are marked as final sale and cannot be returned or exchanged.',
        displayOrder: 2,
        isActive: true,
    },
    {
        category: 'Payments',
        question: 'What payment options do you support?',
        answer: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, Amex), NetBanking, and Cash on Delivery (COD) up to ₹10,000.',
        displayOrder: 1,
        isActive: true,
    },
    {
        category: 'Payments',
        question: 'Is my online transaction and card data secure?',
        answer: 'Yes, 100%. NiaKylie never stores your card credentials. All transactions are securely processed through PCI-DSS Level 1 compliant gateways (Razorpay & Stripe) with 256-bit SSL encryption.',
        displayOrder: 2,
        isActive: true,
    },
];
let CmsService = class CmsService {
    pagesRepo;
    faqsRepo;
    blogsRepo;
    subscribersRepo;
    constructor(pagesRepo, faqsRepo, blogsRepo, subscribersRepo) {
        this.pagesRepo = pagesRepo;
        this.faqsRepo = faqsRepo;
        this.blogsRepo = blogsRepo;
        this.subscribersRepo = subscribersRepo;
    }
    async onModuleInit() {
        for (const page of DEFAULT_PAGES) {
            const existing = await this.pagesRepo.findBySlug(page.slug);
            if (!existing) {
                await this.pagesRepo.create({ ...page, isPublished: true });
            }
        }
        const existingFaqs = await this.faqsRepo.findAllAdmin();
        if (!existingFaqs || existingFaqs.length === 0) {
            for (const faq of DEFAULT_FAQS) {
                await this.faqsRepo.create(faq);
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
    async getFaqsAdmin() {
        return this.faqsRepo.findAllAdmin();
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
    async subscribeNewsletter(dto) {
        const cleanEmail = dto.email?.trim();
        const cleanPhone = dto.phone?.trim();
        if (!cleanEmail && !cleanPhone) {
            throw new common_1.BadRequestException('Please provide an email address or mobile number');
        }
        if (cleanPhone && !/^[6-9]\d{9}$/.test(cleanPhone.replace(/[\s\-\+]/g, '').slice(-10))) {
            throw new common_1.BadRequestException('Please enter a valid 10-digit mobile number');
        }
        const subscriber = await this.subscribersRepo.createOrUpdate({
            email: cleanEmail,
            phone: cleanPhone,
            source: dto.source || 'FOOTER',
        });
        return {
            message: 'Thank you for subscribing! We will send exclusive offers and updates.',
            subscriber,
        };
    }
    async getSubscribers(query) {
        return this.subscribersRepo.findAll(query);
    }
    async deleteSubscriber(id) {
        const deleted = await this.subscribersRepo.deleteById(id);
        if (!deleted)
            throw new common_1.NotFoundException(`Subscriber '${id}' not found`);
        return { message: 'Subscriber record removed successfully' };
    }
};
exports.CmsService = CmsService;
exports.CmsService = CmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pages_repository_js_1.PagesRepository,
        faqs_repository_js_1.FaqsRepository,
        blogs_repository_js_1.BlogsRepository,
        subscribers_repository_js_1.SubscribersRepository])
], CmsService);
//# sourceMappingURL=cms.service.js.map