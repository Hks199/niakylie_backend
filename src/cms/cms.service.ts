import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
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

@Injectable()
export class CmsService implements OnModuleInit {
  constructor(
    private readonly pagesRepo: PagesRepository,
    private readonly faqsRepo: FaqsRepository,
    private readonly blogsRepo: BlogsRepository,
  ) {}

  async onModuleInit() {
    // Auto-seed standard policy pages if absent
    for (const page of DEFAULT_PAGES) {
      const existing = await this.pagesRepo.findBySlug(page.slug);
      if (!existing) {
        await this.pagesRepo.create({ ...page, isPublished: true });
      }
    }
  }

  // ─── PAGES ────────────────────────────────────────────────────────────────

  async getPages(): Promise<PageDocument[]> {
    return this.pagesRepo.findAllPublished();
  }

  async getPageBySlug(slug: string): Promise<PageDocument> {
    const page = await this.pagesRepo.findBySlug(slug);
    if (!page || !page.isPublished) {
      throw new NotFoundException(`Page '${slug}' not found`);
    }
    return page;
  }

  async createPage(dto: CreatePageDto): Promise<PageDocument> {
    const existing = await this.pagesRepo.findBySlug(dto.slug);
    if (existing) {
      throw new BadRequestException(`Page with slug '${dto.slug}' already exists`);
    }
    return this.pagesRepo.create(dto);
  }

  async updatePage(id: string, dto: UpdatePageDto): Promise<PageDocument> {
    const page = await this.pagesRepo.findById(id);
    if (!page) throw new NotFoundException(`Page '${id}' not found`);

    if (dto.slug && dto.slug !== page.slug) {
      const existing = await this.pagesRepo.findBySlug(dto.slug);
      if (existing) throw new BadRequestException(`Slug '${dto.slug}' is already taken`);
    }

    const updated = await this.pagesRepo.update(id, dto);
    return updated!;
  }

  async deletePage(id: string): Promise<{ message: string }> {
    const page = await this.pagesRepo.findById(id);
    if (!page) throw new NotFoundException(`Page '${id}' not found`);

    await this.pagesRepo.softDelete(id);
    return { message: 'Page deleted successfully' };
  }

  // ─── FAQS ─────────────────────────────────────────────────────────────────

  async getFaqs(): Promise<Record<string, FaqDocument[]>> {
    return this.faqsRepo.findAllActiveGrouped();
  }

  async createFaq(dto: CreateFaqDto): Promise<FaqDocument> {
    return this.faqsRepo.create(dto);
  }

  async updateFaq(id: string, dto: UpdateFaqDto): Promise<FaqDocument> {
    const faq = await this.faqsRepo.findById(id);
    if (!faq) throw new NotFoundException(`FAQ '${id}' not found`);

    const updated = await this.faqsRepo.update(id, dto);
    return updated!;
  }

  async deleteFaq(id: string): Promise<{ message: string }> {
    const faq = await this.faqsRepo.findById(id);
    if (!faq) throw new NotFoundException(`FAQ '${id}' not found`);

    await this.faqsRepo.softDelete(id);
    return { message: 'FAQ deleted successfully' };
  }

  // ─── BLOGS ────────────────────────────────────────────────────────────────

  async getBlogs(query: QueryBlogDto) {
    return this.blogsRepo.findPublished(query);
  }

  async getBlogBySlug(slug: string): Promise<BlogDocument> {
    const blog = await this.blogsRepo.findBySlug(slug);
    if (!blog || !blog.isPublished) {
      throw new NotFoundException(`Blog post '${slug}' not found`);
    }

    // Increment view count asynchronously
    await this.blogsRepo.incrementViewCount(blog._id.toString());
    return blog;
  }

  async createBlog(dto: CreateBlogDto): Promise<BlogDocument> {
    const existing = await this.blogsRepo.findBySlug(dto.slug);
    if (existing) {
      throw new BadRequestException(`Blog post with slug '${dto.slug}' already exists`);
    }
    return this.blogsRepo.create(dto);
  }

  async updateBlog(id: string, dto: UpdateBlogDto): Promise<BlogDocument> {
    const blog = await this.blogsRepo.findById(id);
    if (!blog) throw new NotFoundException(`Blog '${id}' not found`);

    if (dto.slug && dto.slug !== blog.slug) {
      const existing = await this.blogsRepo.findBySlug(dto.slug);
      if (existing) throw new BadRequestException(`Slug '${dto.slug}' is already taken`);
    }

    const updated = await this.blogsRepo.update(id, dto);
    return updated!;
  }

  async deleteBlog(id: string): Promise<{ message: string }> {
    const blog = await this.blogsRepo.findById(id);
    if (!blog) throw new NotFoundException(`Blog '${id}' not found`);

    await this.blogsRepo.softDelete(id);
    return { message: 'Blog post deleted successfully' };
  }
}
