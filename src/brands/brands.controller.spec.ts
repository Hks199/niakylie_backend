import { Test, TestingModule } from '@nestjs/testing';
import { BrandsController } from './brands.controller.js';
import { BrandsService } from './brands.service.js';

describe('BrandsController', () => {
  let controller: BrandsController;
  let service: jest.Mocked<BrandsService>;

  beforeEach(async () => {
    const mockBrandsService = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByIdOrSlug: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandsController],
      providers: [{ provide: BrandsService, useValue: mockBrandsService }],
    }).compile();

    controller = module.get<BrandsController>(BrandsController);
    service = module.get(BrandsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate list retrieval to brandsService', async () => {
      const mockResult = { data: [], total: 0 };
      service.findAll.mockResolvedValue(mockResult);

      const query = { page: 1, limit: 10 };
      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toBe(mockResult);
    });
  });

  describe('findOne', () => {
    it('should fetch brand details by id or slug', async () => {
      const mockBrand = { name: 'Zara', slug: 'zara' } as any;
      service.findByIdOrSlug.mockResolvedValue(mockBrand);

      const result = await controller.findOne('zara');
      expect(service.findByIdOrSlug).toHaveBeenCalledWith('zara');
      expect(result).toBe(mockBrand);
    });
  });

  describe('create', () => {
    it('should pass logo path to service when file is uploaded', async () => {
      const mockBrand = { name: 'Zara', slug: 'zara', logo: '/uploads/brands/logo-123.png' } as any;
      service.create.mockResolvedValue(mockBrand);

      const dto = { name: 'Zara' };
      const mockFile = {
        filename: 'logo-123.png',
        mimetype: 'image/png',
        size: 1024 * 100, // 100KB
      } as Express.Multer.File;

      const result = await controller.create(dto, mockFile);
      expect(service.create).toHaveBeenCalledWith(dto, '/uploads/brands/logo-123.png');
      expect(result.logo).toBe('/uploads/brands/logo-123.png');
    });
  });

  describe('remove', () => {
    it('should call delete on brandsService', async () => {
      service.delete.mockResolvedValue(undefined);
      await controller.remove('1');
      expect(service.delete).toHaveBeenCalledWith('1');
    });
  });
});
