import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { CategoriesService } from './categories.service.js';
import { CategoriesRepository } from './repositories/categories.repository.js';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<CategoriesRepository>;

  beforeEach(async () => {
    const mockCategoriesRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      softDeleteDescendants: jest.fn(),
      findDirectChildren: jest.fn(),
      findDescendants: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesRepository, useValue: mockCategoriesRepository },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get(CategoriesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if slug already exists', async () => {
      repository.findBySlug.mockResolvedValue({ id: '1', name: 'Ethnic' } as any);
      await expect(service.create({ name: 'Ethnic' })).rejects.toThrow(BadRequestException);
    });

    it('should compute ancestors list if parentId provided', async () => {
      const parentId = new Types.ObjectId().toString();
      const mockParent = {
        _id: parentId,
        name: 'Women',
        slug: 'women',
        ancestors: [],
      } as any;

      repository.findBySlug.mockResolvedValue(null);
      repository.findById.mockResolvedValue(mockParent);
      repository.create.mockImplementation((data) => ({ ...data, _id: 'child123' } as any));

      const result = await service.create({ name: 'Ethnic Wear', parentId });
      expect(result.parentId!.toString()).toBe(parentId);
      expect(result.ancestors).toEqual([{ _id: mockParent._id, name: 'Women', slug: 'women' }]);
      expect(repository.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should throw BadRequestException on cycle detection (parent is descendant of target)', async () => {
      const categoryId = 'target123';
      const parentId = 'parent123';

      repository.findById.mockImplementation(async (id: string) => {
        if (id === categoryId) {
          return { _id: categoryId, name: 'Ethnic', ancestors: [] } as any;
        }
        if (id === parentId) {
          return {
            _id: parentId,
            name: 'Sub Ethnic',
            ancestors: [{ _id: categoryId, name: 'Ethnic', slug: 'ethnic' }],
          } as any;
        }
        return null;
      });

      await expect(
        service.update(categoryId, { parentId }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should trigger cascading soft-deletes on descendants', async () => {
      repository.findById.mockResolvedValue({ _id: '1', name: 'Category' } as any);

      await service.delete('1');
      expect(repository.softDelete).toHaveBeenCalledWith('1');
      expect(repository.softDeleteDescendants).toHaveBeenCalledWith('1');
    });
  });
});
