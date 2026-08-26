import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { ProductsService } from './products.service.js';
import { ProductsRepository } from './repositories/products.repository.js';
import { S3Service } from '../s3/s3.service.js';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<ProductsRepository>;
  let s3Service: jest.Mocked<S3Service>;

  beforeEach(async () => {
    const mockProductsRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      addImages: jest.fn(),
      addVariant: jest.fn(),
      updateVariant: jest.fn(),
      deleteVariant: jest.fn(),
    };

    const mockS3Service = {
      uploadBuffer: jest.fn(),
      uploadManyBuffers: jest.fn(),
      deleteByUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: mockProductsRepository },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(ProductsRepository);
    s3Service = module.get(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if slug already exists', async () => {
      repository.findBySlug.mockResolvedValue({ _id: '1' } as any);
      await expect(service.create({ name: 'Floral Kurti', categoryId: new Types.ObjectId().toString() })).rejects.toThrow(BadRequestException);
    });

    it('should auto-generate SKU if not provided in variant', async () => {
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockImplementation(async (data: any) => data as any);

      const categoryId = new Types.ObjectId().toString();
      const result = await service.create({
        name: 'Silk Saree',
        categoryId,
        variants: [{ color: 'Red', size: 'Free Size', mrp: 3000, offerPrice: 2000 }],
      });

      expect(result.variants[0].sku).toMatch(/^NIA-/);
    });

    it('should throw BadRequestException if offerPrice exceeds mrp', async () => {
      repository.findBySlug.mockResolvedValue(null);
      const categoryId = new Types.ObjectId().toString();
      await expect(
        service.create({
          name: 'Test Product',
          categoryId,
          variants: [{ color: 'Red', size: 'M', mrp: 500, offerPrice: 800 }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should compute correct discount percentage', async () => {
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockImplementation(async (data: any) => data as any);
      const categoryId = new Types.ObjectId().toString();

      const result = await service.create({
        name: 'Cotton Kurti',
        categoryId,
        variants: [{ color: 'Blue', size: 'L', mrp: 1000, offerPrice: 750 }],
      });

      // discount = round((1000 - 750) / 1000 * 100) = 25
      expect(result.variants[0].discount).toBe(25);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if product not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.delete('unknownId')).rejects.toThrow(NotFoundException);
    });

    it('should soft delete when product exists', async () => {
      repository.findById.mockResolvedValue({ _id: '1' } as any);
      await service.delete('1');
      expect(repository.softDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('addVariant', () => {
    it('should throw BadRequestException when offerPrice > mrp', async () => {
      repository.findById.mockResolvedValue({ _id: '1', variants: [] } as any);
      await expect(
        service.addVariant('1', { color: 'Pink', size: 'S', mrp: 500, offerPrice: 700 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByIdOrSlug', () => {
    it('should throw NotFoundException if no product found', async () => {
      repository.findById.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      await expect(service.findByIdOrSlug('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
