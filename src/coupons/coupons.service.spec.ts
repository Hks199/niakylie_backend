import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { CouponsService } from './coupons.service.js';
import { CouponsRepository } from './repositories/coupons.repository.js';
import { CouponType, CouponApplicability } from './schemas/coupon.schema.js';

describe('CouponsService', () => {
  let service: CouponsService;
  let repo: jest.Mocked<CouponsRepository>;

  const productId1 = new Types.ObjectId('60d5ecb8b392d40015f8a001');
  const categoryId1 = new Types.ObjectId('60d5ecb8b392d40015f8a002');
  const userId1 = new Types.ObjectId('60d5ecb8b392d40015f8a003');

  const mockCoupon = {
    _id: new Types.ObjectId('60d5ecb8b392d40015f8a010'),
    code: 'WELCOME10',
    title: 'Welcome Discount',
    description: '10% off on first order',
    type: CouponType.PERCENTAGE,
    value: 10,
    applicability: CouponApplicability.ALL,
    applicableProductIds: [],
    applicableCategoryIds: [],
    applicableCustomerIds: [],
    minOrderAmount: 500,
    maxDiscount: 200,
    usageLimit: 100,
    usedCount: 5,
    userLimit: 1,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    isActive: true,
    isDeleted: false,
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      findActiveCoupons: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      incrementUsedCount: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        { provide: CouponsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
    repo = module.get(CouponsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCoupon', () => {
    it('should throw ConflictException if coupon code already exists', async () => {
      repo.findByCode.mockResolvedValue(mockCoupon as any);

      await expect(
        service.createCoupon({
          code: 'WELCOME10',
          type: CouponType.FLAT,
          value: 100,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if startDate >= endDate', async () => {
      repo.findByCode.mockResolvedValue(null);

      await expect(
        service.createCoupon({
          code: 'WELCOME10',
          type: CouponType.FLAT,
          value: 100,
          startDate: '2026-12-31',
          endDate: '2026-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create and return coupon', async () => {
      repo.findByCode.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockCoupon as any);

      const result = await service.createCoupon({
        code: 'WELCOME10',
        type: CouponType.PERCENTAGE,
        value: 10,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      });

      expect(result).toEqual(mockCoupon);
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate flat discount correctly', () => {
      const flatCoupon = {
        ...mockCoupon,
        type: CouponType.FLAT,
        value: 300,
        applicability: CouponApplicability.ALL,
      };

      const discount = service.calculateDiscount(flatCoupon as any, 1000);
      expect(discount).toBe(300);
    });

    it('should respect maxDiscount for percentage coupons', () => {
      const percentageCoupon = {
        ...mockCoupon,
        type: CouponType.PERCENTAGE,
        value: 20,
        maxDiscount: 150,
      };

      // 20% of 1000 = 200, capped at maxDiscount 150
      const discount = service.calculateDiscount(percentageCoupon as any, 1000);
      expect(discount).toBe(150);
    });

    it('should calculate discount for product-specific coupon', () => {
      const productCoupon = {
        ...mockCoupon,
        type: CouponType.PERCENTAGE,
        value: 10,
        maxDiscount: null,
        applicability: CouponApplicability.PRODUCT,
        applicableProductIds: [productId1],
      };

      const items = [
        { productId: productId1.toString(), quantity: 2, unitPrice: 500 }, // Eligible 1000
        { productId: 'otherProduct', quantity: 1, unitPrice: 2000 },       // Non-eligible 2000
      ];

      const discount = service.calculateDiscount(productCoupon as any, 3000, items);
      expect(discount).toBe(100); // 10% of 1000 eligible = 100
    });
  });

  describe('validateCoupon', () => {
    it('should throw NotFoundException if coupon does not exist or is inactive', async () => {
      repo.findByCode.mockResolvedValue(null);

      await expect(
        service.validateCoupon({ code: 'INVALID', subtotal: 1000 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if coupon is expired', async () => {
      const expiredCoupon = {
        ...mockCoupon,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      };
      repo.findByCode.mockResolvedValue(expiredCoupon as any);

      await expect(
        service.validateCoupon({ code: 'WELCOME10', subtotal: 1000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if subtotal is less than minOrderAmount', async () => {
      repo.findByCode.mockResolvedValue(mockCoupon as any);

      await expect(
        service.validateCoupon({ code: 'WELCOME10', subtotal: 200 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate successfully and return discount amount', async () => {
      repo.findByCode.mockResolvedValue(mockCoupon as any);

      const result = await service.validateCoupon({ code: 'WELCOME10', subtotal: 1000 });

      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(100); // 10% of 1000
    });
  });

  describe('toggleStatus', () => {
    it('should toggle coupon active status', async () => {
      repo.findById.mockResolvedValue(mockCoupon as any);
      repo.update.mockResolvedValue({ ...mockCoupon, isActive: false } as any);

      const result = await service.toggleStatus(mockCoupon._id.toString());
      expect(result.isActive).toBe(false);
    });
  });
});
