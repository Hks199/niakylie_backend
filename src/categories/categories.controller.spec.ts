import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { S3Service } from '../s3/s3.service.js';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: jest.Mocked<CategoriesService>;

  beforeEach(async () => {
    const mockCategoriesService = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      findByIdOrSlug: jest.fn(),
      findOne: jest.fn(),
      getCategoryTree: jest.fn(),
      toggleActive: jest.fn(),
      findAll: jest.fn(),
    };

    const mockS3Service = {
      uploadBuffer: jest.fn(),
      uploadManyBuffers: jest.fn(),
      deleteByUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate list retrieval to categoriesService', async () => {
      const mockResult = { data: [], total: 0 } as any;
      service.findAll.mockResolvedValue(mockResult);

      const query = { page: 1, limit: 10 };
      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toBe(mockResult);
    });
  });

  describe('findOne', () => {
    it('should fetch category details by slug/id', async () => {
      const mockCategory = { name: 'Ethnic', slug: 'ethnic' } as any;
      service.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne('ethnic');
      expect(service.findOne).toHaveBeenCalledWith('ethnic');
      expect(result).toBe(mockCategory);
    });
  });
});
