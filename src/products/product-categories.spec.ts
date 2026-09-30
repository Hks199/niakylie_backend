import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProductsService } from './products.service.js';
import { ProductsRepository } from './repositories/products.repository.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { MongoSearchProvider } from '../search/providers/mongo-search.provider.js';

describe('Product categories', () => {
  const first = new Types.ObjectId().toString();
  const second = new Types.ObjectId().toString();
  let repository: any;
  let service: ProductsService;

  beforeEach(() => {
    repository = {
      findBySlug: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue({ name: 'Product', categoryId: first }),
      categoriesExist: jest.fn().mockResolvedValue(true),
      create: jest.fn().mockImplementation(async (data) => data),
      update: jest.fn().mockImplementation(async (_id, data) => data.$set),
    };
    service = new ProductsService(repository, {} as any);
  });

  it('creates multiple memberships, deduplicates and keeps a primary category', async () => {
    const result = await service.create({ name: 'Product', categoryIds: [first, second, first] });
    expect(result.categoryIds.map(String)).toEqual([first, second]);
    expect(String(result.categoryId)).toBe(first);
  });

  it('accepts legacy single category creation', async () => {
    const result = await service.create({ name: 'Product', categoryId: first });
    expect(result.categoryIds.map(String)).toEqual([first]);
  });

  it('replaces memberships and primary category when editing', async () => {
    const result = await service.update(first, { categoryIds: [second] });
    expect(result.categoryIds.map(String)).toEqual([second]);
    expect(String(result.categoryId)).toBe(second);
  });

  it('preserves categories on unrelated updates', async () => {
    await service.update(first, { description: 'Changed' });
    expect(repository.update).toHaveBeenCalledWith(first, { $set: { description: 'Changed' } });
    expect(repository.categoriesExist).not.toHaveBeenCalled();
  });

  it.each([[], null, ['invalid'], [first, null]].map((categoryIds) => ({ categoryIds })))('rejects invalid memberships $categoryIds', async ({ categoryIds }) => {
    await expect(service.update(first, { categoryIds } as any)).rejects.toThrow(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('requires a category when creating', async () => {
    await expect(service.create({ name: 'Product' })).rejects.toThrow(BadRequestException);
  });

  it('rejects missing or deleted categories', async () => {
    repository.categoriesExist.mockResolvedValue(false);
    await expect(service.create({ name: 'Product', categoryIds: [first] })).rejects.toThrow(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('validates array payloads and partial edits through DTOs', async () => {
    expect(await validate(plainToInstance(CreateProductDto, { name: 'Product', categoryIds: [first, second] }))).toHaveLength(0);
    expect(await validate(plainToInstance(UpdateProductDto, { description: 'Changed' }))).toHaveLength(0);
    for (const categoryIds of [[], 'invalid', ['invalid']]) {
      expect((await validate(plainToInstance(UpdateProductDto, { categoryIds }))).length).toBeGreaterThan(0);
    }
  });

  it('filters catalog by secondary categories and descendants without unwinding memberships', async () => {
    const aggregate = jest.fn().mockReturnValue({ exec: async () => [{ data: [], total: [] }] });
    const model = { aggregate, db: { collection: () => ({ find: () => ({ toArray: async () => [{ _id: new Types.ObjectId(second) }] }) }) } };
    const repo = new ProductsRepository(model as any);
    await repo.findAll({ categoryId: first, search: 'Product' });
    const pipeline = aggregate.mock.calls[0][0];
    const categoryFilters = pipeline[0].$match.$and[0].$or;
    const membershipFilter = categoryFilters.find((filter: any) => filter.categoryIds);
    expect(membershipFilter.categoryIds.$in.map(String)).toEqual(expect.arrayContaining([first, second]));
    const data = pipeline.find((stage: any) => stage.$facet).$facet.data;
    expect(data.some((stage: any) => stage.$lookup?.as === 'categories')).toBe(true);
    expect(data.some((stage: any) => stage.$unwind?.path === '$categories')).toBe(false);
  });

  it('combines search text with category memberships and descendants', async () => {
    const aggregate = jest.fn().mockReturnValue({ exec: async () => [{}] });
    const model = { aggregate, db: { collection: () => ({ find: () => ({ toArray: async () => [{ _id: new Types.ObjectId(second) }] }) }) } };
    await new MongoSearchProvider(model as any).search({ q: 'silk', categoryId: first });
    const match = aggregate.mock.calls[0][0][0].$match;
    expect(match.$or[0].name.$regex).toBe('silk');
    expect(match.$and[0].$or[1].categoryIds.$in.map(String)).toEqual([first, second]);
  });
});
