import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { BannersService } from './banners.service.js';
import { BannersRepository } from './repositories/banners.repository.js';
import { S3Service } from '../s3/s3.service.js';
import { BannerType, BannerPosition } from './schemas/banner.schema.js';

describe('BannersService', () => {
  let service: BannersService;
  let bannersRepo: jest.Mocked<BannersRepository>;
  let s3Service: jest.Mocked<S3Service>;

  const bannerId = new Types.ObjectId('60d5ecb8b392d40015f8a001');

  const mockBanner = {
    _id: bannerId,
    title: 'Diwali Sale',
    type: BannerType.FESTIVAL,
    position: BannerPosition.TOP,
    imageUrl: 'https://bucket.s3.ap-south-1.amazonaws.com/banners/diwali.jpg',
    mobileImageUrl: undefined,
    isActive: true,
    displayOrder: 1,
    isDeleted: false,
  };

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const mockS3 = {
      uploadBuffer: jest.fn().mockResolvedValue('https://bucket.s3.ap-south-1.amazonaws.com/banners/new.jpg'),
      deleteByUrl: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannersService,
        { provide: BannersRepository, useValue: mockRepo },
        { provide: S3Service, useValue: mockS3 },
      ],
    }).compile();

    service = module.get<BannersService>(BannersService);
    bannersRepo = module.get(BannersRepository);
    s3Service = module.get(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActiveBanners', () => {
    it('should return active banners filtered by type', async () => {
      bannersRepo.findActive.mockResolvedValue([mockBanner as any]);

      const result = await service.getActiveBanners({ type: BannerType.FESTIVAL });
      expect(bannersRepo.findActive).toHaveBeenCalledWith({ type: BannerType.FESTIVAL });
      expect(result).toHaveLength(1);
    });
  });

  describe('createBanner', () => {
    it('should throw BadRequestException if no image is provided', async () => {
      await expect(
        service.createBanner(
          { title: 'Test', type: BannerType.HOMEPAGE },
          {},
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should upload image to S3 and create banner', async () => {
      bannersRepo.create.mockResolvedValue(mockBanner as any);

      const mockFile = {
        buffer: Buffer.from('fake-image'),
        originalname: 'banner.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const result = await service.createBanner(
        { title: 'Diwali Sale', type: BannerType.FESTIVAL },
        { image: [mockFile] },
      );

      expect(s3Service.uploadBuffer).toHaveBeenCalledWith(
        mockFile.buffer,
        'banners',
        'banner.jpg',
        'image/jpeg',
      );
      expect(bannersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: 'https://bucket.s3.ap-south-1.amazonaws.com/banners/new.jpg' }),
      );
      expect(result).toBe(mockBanner);
    });
  });

  describe('updateBanner', () => {
    it('should replace image in S3 and update banner', async () => {
      bannersRepo.findById.mockResolvedValue(mockBanner as any);
      bannersRepo.update.mockResolvedValue({ ...mockBanner, title: 'Updated' } as any);

      const mockFile = {
        buffer: Buffer.from('new-image'),
        originalname: 'new.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const result = await service.updateBanner(
        bannerId.toString(),
        { title: 'Updated' },
        { image: [mockFile] },
      );

      expect(s3Service.deleteByUrl).toHaveBeenCalledWith(mockBanner.imageUrl);
      expect(s3Service.uploadBuffer).toHaveBeenCalled();
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException for non-existent banner', async () => {
      bannersRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateBanner('invalid-id', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteBanner', () => {
    it('should delete images from S3 and soft delete banner', async () => {
      bannersRepo.findById.mockResolvedValue(mockBanner as any);
      bannersRepo.softDelete.mockResolvedValue({ ...mockBanner, isDeleted: true } as any);

      const result = await service.deleteBanner(bannerId.toString());

      expect(s3Service.deleteByUrl).toHaveBeenCalledWith(mockBanner.imageUrl);
      expect(bannersRepo.softDelete).toHaveBeenCalledWith(bannerId.toString());
      expect(result.message).toBe('Banner deleted successfully');
    });
  });

  describe('toggleActive', () => {
    it('should toggle banner isActive state', async () => {
      bannersRepo.findById.mockResolvedValue(mockBanner as any);
      bannersRepo.update.mockResolvedValue({ ...mockBanner, isActive: false } as any);

      const result = await service.toggleActive(bannerId.toString());
      expect(bannersRepo.update).toHaveBeenCalledWith(bannerId.toString(), { isActive: false });
      expect(result.isActive).toBe(false);
    });
  });

  describe('reorder', () => {
    it('should batch update displayOrder for all given banners', async () => {
      bannersRepo.update.mockResolvedValue(mockBanner as any);

      const orders = [
        { id: bannerId.toString(), displayOrder: 0 },
        { id: new Types.ObjectId().toString(), displayOrder: 1 },
      ];

      const result = await service.reorder(orders);
      expect(bannersRepo.update).toHaveBeenCalledTimes(2);
      expect(result.message).toContain('2');
    });
  });
});
