import { Test, TestingModule } from '@nestjs/testing';
import { CmsController } from './cms.controller.js';
import { CmsService } from './cms.service.js';

describe('CmsController', () => {
  let controller: CmsController;
  let service: jest.Mocked<CmsService>;

  const mockPage = { slug: 'about-us', title: 'About Us' };
  const mockFaq = { question: 'Tracking?', answer: 'Use link' };
  const mockBlog = { slug: 'silk-trends', title: 'Silk Trends' };

  beforeEach(async () => {
    const mockService = {
      getPages: jest.fn(),
      getPageBySlug: jest.fn(),
      createPage: jest.fn(),
      updatePage: jest.fn(),
      deletePage: jest.fn(),
      getFaqs: jest.fn(),
      createFaq: jest.fn(),
      updateFaq: jest.fn(),
      deleteFaq: jest.fn(),
      getBlogs: jest.fn(),
      getBlogBySlug: jest.fn(),
      createBlog: jest.fn(),
      updateBlog: jest.fn(),
      deleteBlog: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmsController],
      providers: [{ provide: CmsService, useValue: mockService }],
    }).compile();

    controller = module.get<CmsController>(CmsController);
    service = module.get(CmsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPages', () => {
    it('should delegate fetching pages to service', async () => {
      service.getPages.mockResolvedValue([mockPage] as any);

      const result = await controller.getPages();
      expect(service.getPages).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('getPageBySlug', () => {
    it('should delegate page lookup to service', async () => {
      service.getPageBySlug.mockResolvedValue(mockPage as any);

      const result = await controller.getPageBySlug('about-us');
      expect(service.getPageBySlug).toHaveBeenCalledWith('about-us');
      expect(result.slug).toBe('about-us');
    });
  });

  describe('getFaqs', () => {
    it('should delegate FAQ retrieval to service', async () => {
      service.getFaqs.mockResolvedValue({ General: [mockFaq as any] });

      const result = await controller.getFaqs();
      expect(service.getFaqs).toHaveBeenCalled();
      expect(result.General).toHaveLength(1);
    });
  });

  describe('getBlogs', () => {
    it('should delegate blog listing to service', async () => {
      service.getBlogs.mockResolvedValue({ data: [mockBlog as any], total: 1, page: 1, limit: 10 });

      const result = await controller.getBlogs({ page: 1, limit: 10 });
      expect(service.getBlogs).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result.total).toBe(1);
    });
  });
});
