import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { CmsService } from './cms.service.js';
import { PagesRepository } from './repositories/pages.repository.js';
import { FaqsRepository } from './repositories/faqs.repository.js';
import { BlogsRepository } from './repositories/blogs.repository.js';
import { SubscribersRepository } from './repositories/subscribers.repository.js';

describe('CmsService', () => {
  let service: CmsService;
  let pagesRepo: jest.Mocked<PagesRepository>;
  let faqsRepo: jest.Mocked<FaqsRepository>;
  let blogsRepo: jest.Mocked<BlogsRepository>;

  const pageId = new Types.ObjectId('60d5ecb8b392d40015f8a001');
  const faqId = new Types.ObjectId('60d5ecb8b392d40015f8a002');
  const blogId = new Types.ObjectId('60d5ecb8b392d40015f8a003');

  const mockPage = {
    _id: pageId,
    title: 'About Us',
    slug: 'about-us',
    content: '<p>About NiaKylie</p>',
    isPublished: true,
  };

  const mockFaq = {
    _id: faqId,
    question: 'How to order?',
    answer: 'Select items and checkout.',
    category: 'General',
    displayOrder: 1,
    isActive: true,
  };

  const mockBlog = {
    _id: blogId,
    title: 'Silk Saree Trends',
    slug: 'silk-saree-trends',
    content: '<p>Content</p>',
    isPublished: true,
    viewCount: 10,
  };

  beforeEach(async () => {
    const mockPagesRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAllPublished: jest.fn(),
      findAllAdmin: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockFaqsRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findAllActiveGrouped: jest.fn(),
      findAllAdmin: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockBlogsRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findPublished: jest.fn(),
      incrementViewCount: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockSubscribersRepo = {
      createOrUpdate: jest.fn(),
      findAll: jest.fn(),
      deleteById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsService,
        { provide: PagesRepository, useValue: mockPagesRepo },
        { provide: FaqsRepository, useValue: mockFaqsRepo },
        { provide: BlogsRepository, useValue: mockBlogsRepo },
        { provide: SubscribersRepository, useValue: mockSubscribersRepo },
      ],
    }).compile();

    service = module.get<CmsService>(CmsService);
    pagesRepo = module.get(PagesRepository);
    faqsRepo = module.get(FaqsRepository);
    blogsRepo = module.get(BlogsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should seed default policy pages if they do not exist', async () => {
      pagesRepo.findBySlug.mockResolvedValue(null);
      pagesRepo.create.mockResolvedValue(mockPage as any);

      await service.onModuleInit();

      expect(pagesRepo.create).toHaveBeenCalledTimes(5);
    });
  });

  describe('getPageBySlug', () => {
    it('should return published page', async () => {
      pagesRepo.findBySlug.mockResolvedValue(mockPage as any);

      const result = await service.getPageBySlug('about-us');
      expect(result.slug).toBe('about-us');
    });

    it('should throw NotFoundException if page does not exist or unpublished', async () => {
      pagesRepo.findBySlug.mockResolvedValue(null);

      await expect(service.getPageBySlug('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPage', () => {
    it('should throw BadRequestException if slug already exists', async () => {
      pagesRepo.findBySlug.mockResolvedValue(mockPage as any);

      await expect(
        service.createPage({ title: 'About Us', slug: 'about-us', content: 'Content' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getFaqs', () => {
    it('should return categorized FAQs', async () => {
      faqsRepo.findAllActiveGrouped.mockResolvedValue({ General: [mockFaq as any] });

      const result = await service.getFaqs();
      expect(result.General).toHaveLength(1);
    });
  });

  describe('getBlogBySlug', () => {
    it('should return blog post and increment view count', async () => {
      blogsRepo.findBySlug.mockResolvedValue(mockBlog as any);

      const result = await service.getBlogBySlug('silk-saree-trends');
      expect(blogsRepo.incrementViewCount).toHaveBeenCalledWith(blogId.toString());
      expect(result.slug).toBe('silk-saree-trends');
    });
  });
});
