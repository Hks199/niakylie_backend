import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;

  beforeEach(async () => {
    const mockProductsService = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByIdOrSlug: jest.fn(),
      findAll: jest.fn(),
      uploadImages: jest.fn(),
      addVariant: jest.fn(),
      updateVariant: jest.fn(),
      deleteVariant: jest.fn(),
      uploadVariantImages: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to productsService.findAll', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 12 };
      service.findAll.mockResolvedValue(mockResult);

      const query = { page: 1, limit: 12 };
      const result = await controller.findAll(query);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toBe(mockResult);
    });
  });

  describe('findOne', () => {
    it('should fetch product by slug', async () => {
      const mockProduct = { name: 'Kurti', slug: 'kurti' } as any;
      service.findByIdOrSlug.mockResolvedValue(mockProduct);

      const result = await controller.findOne('kurti');
      expect(service.findByIdOrSlug).toHaveBeenCalledWith('kurti');
      expect(result).toBe(mockProduct);
    });
  });

  describe('uploadImages', () => {
    it('should throw BadRequestException when no files provided', async () => {
      await expect(controller.uploadImages('prod1', [])).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const badFile = [{ mimetype: 'application/pdf', originalname: 'doc.pdf', size: 1024 }] as Express.Multer.File[];
      await expect(controller.uploadImages('prod1', badFile)).rejects.toThrow(BadRequestException);
    });
  });

  describe('addVariant', () => {
    it('should delegate to productsService.addVariant', async () => {
      const mockProduct = { _id: '1', variants: [] } as any;
      service.addVariant.mockResolvedValue(mockProduct);

      const dto = { color: 'Red', size: 'M', mrp: 1000, offerPrice: 750 };
      const result = await controller.addVariant('1', dto);
      expect(service.addVariant).toHaveBeenCalledWith('1', dto);
      expect(result).toBe(mockProduct);
    });
  });
});
