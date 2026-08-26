import { Test, TestingModule } from '@nestjs/testing';
import { BannersController } from './banners.controller.js';
import { BannersService } from './banners.service.js';
import { BannerType, BannerPosition } from './schemas/banner.schema.js';

describe('BannersController', () => {
  let controller: BannersController;
  let service: jest.Mocked<BannersService>;

  const mockBanner = {
    _id: '60d5ecb8b392d40015f8a001',
    title: 'Diwali Sale',
    type: BannerType.FESTIVAL,
    position: BannerPosition.TOP,
    imageUrl: 'https://bucket.s3.amazonaws.com/banners/diwali.jpg',
    isActive: true,
  };

  beforeEach(async () => {
    const mockService = {
      getActiveBanners: jest.fn(),
      getBannerById: jest.fn(),
      getAllBanners: jest.fn(),
      createBanner: jest.fn(),
      updateBanner: jest.fn(),
      toggleActive: jest.fn(),
      reorder: jest.fn(),
      deleteBanner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannersController],
      providers: [{ provide: BannersService, useValue: mockService }],
    }).compile();

    controller = module.get<BannersController>(BannersController);
    service = module.get(BannersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getActiveBanners', () => {
    it('should delegate active banner listing to service', async () => {
      service.getActiveBanners.mockResolvedValue([mockBanner as any]);

      const result = await controller.getActiveBanners({ type: BannerType.FESTIVAL });
      expect(service.getActiveBanners).toHaveBeenCalledWith({ type: BannerType.FESTIVAL });
      expect(result).toHaveLength(1);
    });
  });

  describe('getAllBanners', () => {
    it('should delegate admin banner listing to service', async () => {
      service.getAllBanners.mockResolvedValue([mockBanner as any]);

      const result = await controller.getAllBanners({});
      expect(service.getAllBanners).toHaveBeenCalledWith({});
      expect(result).toHaveLength(1);
    });
  });

  describe('toggleActive', () => {
    it('should delegate toggle-active to service', async () => {
      service.toggleActive.mockResolvedValue({ ...mockBanner, isActive: false } as any);

      const result = await controller.toggleActive('60d5ecb8b392d40015f8a001');
      expect(service.toggleActive).toHaveBeenCalledWith('60d5ecb8b392d40015f8a001');
      expect(result.isActive).toBe(false);
    });
  });

  describe('deleteBanner', () => {
    it('should delegate deletion to service', async () => {
      service.deleteBanner.mockResolvedValue({ message: 'Banner deleted successfully' });

      const result = await controller.deleteBanner('60d5ecb8b392d40015f8a001');
      expect(service.deleteBanner).toHaveBeenCalledWith('60d5ecb8b392d40015f8a001');
      expect(result.message).toBe('Banner deleted successfully');
    });
  });
});
