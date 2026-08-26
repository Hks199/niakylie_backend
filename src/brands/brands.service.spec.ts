import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { BrandsService } from './brands.service.js';
import { BrandsRepository } from './repositories/brands.repository.js';

describe('BrandsService', () => {
  let service: BrandsService;
  let repository: jest.Mocked<BrandsRepository>;

  beforeEach(async () => {
    const mockBrandsRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        { provide: BrandsRepository, useValue: mockBrandsRepository },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
    repository = module.get(BrandsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if slug already exists', async () => {
      repository.findBySlug.mockResolvedValue({ id: '1', name: 'Zara' } as any);
      await expect(service.create({ name: 'Zara' })).rejects.toThrow(BadRequestException);
    });

    it('should create a brand with generated slug when name is unique', async () => {
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue({ name: 'Zara', slug: 'zara' } as any);

      const result = await service.create({ name: 'Zara' });
      expect(result.slug).toBe('zara');
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Zara', slug: 'zara' }),
      );
    });

    it('should pass logo path when provided', async () => {
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue({ name: 'Zara', slug: 'zara', logo: '/uploads/brands/logo.png' } as any);

      const result = await service.create({ name: 'Zara' }, '/uploads/brands/logo.png');
      expect(result.logo).toBe('/uploads/brands/logo.png');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if brand not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.update('unknownId', { name: 'New Name' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if new name slug conflicts with another brand', async () => {
      repository.findById.mockResolvedValue({ _id: '1', name: 'Zara', slug: 'zara' } as any);
      repository.findBySlug.mockResolvedValue({ _id: '2', name: 'Zara Global', slug: 'zara-global' } as any);

      await expect(service.update('1', { name: 'Zara Global' })).rejects.toThrow(BadRequestException);
    });

    it('should update brand status successfully', async () => {
      repository.findById.mockResolvedValue({ _id: '1', name: 'Zara', slug: 'zara' } as any);
      repository.update.mockResolvedValue({ _id: '1', name: 'Zara', slug: 'zara', status: false } as any);

      const result = await service.update('1', { status: false });
      expect(result.status).toBe(false);
      expect(repository.update).toHaveBeenCalledWith('1', {
        $set: expect.objectContaining({ status: false }),
      });
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if brand not found', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.delete('unknownId')).rejects.toThrow(NotFoundException);
    });

    it('should soft delete brand if found', async () => {
      repository.findById.mockResolvedValue({ _id: '1', name: 'Zara' } as any);

      await service.delete('1');
      expect(repository.softDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('findByIdOrSlug', () => {
    it('should throw NotFoundException if not found by id or slug', async () => {
      repository.findById.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);

      await expect(service.findByIdOrSlug('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should return brand found by slug', async () => {
      const mockBrand = { name: 'Zara', slug: 'zara' } as any;
      repository.findById.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(mockBrand);

      const result = await service.findByIdOrSlug('zara');
      expect(result).toBe(mockBrand);
    });
  });
});
