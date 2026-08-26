import { Test, TestingModule } from '@nestjs/testing';
import { CouponsController } from './coupons.controller.js';
import { CouponsService } from './coupons.service.js';
import { CouponType } from './schemas/coupon.schema.js';

describe('CouponsController', () => {
  let controller: CouponsController;
  let service: jest.Mocked<CouponsService>;

  const mockCoupon = {
    _id: '60d5ecb8b392d40015f8a010',
    code: 'WELCOME10',
    type: CouponType.PERCENTAGE,
    value: 10,
    isActive: true,
  };

  beforeEach(async () => {
    const mockService = {
      createCoupon: jest.fn(),
      findAll: jest.fn(),
      findActiveCoupons: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      validateCoupon: jest.fn(),
      updateCoupon: jest.fn(),
      toggleStatus: jest.fn(),
      deleteCoupon: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponsController],
      providers: [{ provide: CouponsService, useValue: mockService }],
    }).compile();

    controller = module.get<CouponsController>(CouponsController);
    service = module.get(CouponsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate coupon creation to service', async () => {
      service.createCoupon.mockResolvedValue(mockCoupon as any);

      const dto = {
        code: 'WELCOME10',
        type: CouponType.PERCENTAGE,
        value: 10,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      };

      const result = await controller.create(dto);
      expect(service.createCoupon).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockCoupon);
    });
  });

  describe('validate', () => {
    it('should validate coupon and return discount details', async () => {
      const mockResult = {
        valid: true,
        code: 'WELCOME10',
        type: CouponType.PERCENTAGE,
        discountAmount: 100,
        message: 'Coupon applied successfully',
        coupon: mockCoupon as any,
      };

      service.validateCoupon.mockResolvedValue(mockResult);

      const dto = { code: 'WELCOME10', subtotal: 1000 };
      const result = await controller.validate(dto);

      expect(service.validateCoupon).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockResult);
    });
  });

  describe('findActive', () => {
    it('should return list of active coupons', async () => {
      service.findActiveCoupons.mockResolvedValue([mockCoupon] as any);

      const result = await controller.findActive();
      expect(service.findActiveCoupons).toHaveBeenCalled();
      expect(result).toEqual([mockCoupon]);
    });
  });

  describe('toggleStatus', () => {
    it('should toggle coupon status via service', async () => {
      const updated = { ...mockCoupon, isActive: false };
      service.toggleStatus.mockResolvedValue(updated as any);

      const result = await controller.toggleStatus('60d5ecb8b392d40015f8a010');
      expect(service.toggleStatus).toHaveBeenCalledWith('60d5ecb8b392d40015f8a010');
      expect(result).toEqual(updated);
    });
  });
});
