import { Test, TestingModule } from '@nestjs/testing';

import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';

describe('CartController', () => {
  let controller: CartController;
  let service: jest.Mocked<CartService>;

  beforeEach(async () => {
    const mockCartService = {
      getCart: jest.fn(),
      addToCart: jest.fn(),
      updateItemQuantity: jest.fn(),
      removeItem: jest.fn(),
      mergeGuestCart: jest.fn(),
      toggleSaveForLater: jest.fn(),
      moveToWishlist: jest.fn(),
      applyCoupon: jest.fn(),
      removeCoupon: jest.fn(),
      clearCart: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: mockCartService }],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCart', () => {
    it('should extract guestId from header and delegate to service', async () => {
      const mockCart = { items: [], grandTotal: 0 };
      service.getCart.mockResolvedValue(mockCart as any);

      const req = {};
      const result = await controller.getCart(req, 'guest123');

      expect(service.getCart).toHaveBeenCalledWith(undefined, 'guest123');
      expect(result).toBe(mockCart);
    });
  });

  describe('addToCart', () => {
    it('should delegate to cartService.addToCart', async () => {
      const mockCart = { items: [{ sku: 'NIA-SKU1' }], grandTotal: 2000 };
      service.addToCart.mockResolvedValue(mockCart as any);

      const dto = { productId: 'prod1', sku: 'NIA-SKU1', quantity: 1 };
      const req = { user: { id: 'user123' } };

      const result = await controller.addToCart(dto, req, undefined);

      expect(service.addToCart).toHaveBeenCalledWith(dto, 'user123');
      expect(result).toBe(mockCart);
    });
  });

  describe('mergeGuestCart', () => {
    it('should delegate to cartService.mergeGuestCart', async () => {
      const mockCart = { items: [], grandTotal: 0 };
      service.mergeGuestCart.mockResolvedValue(mockCart as any);

      const dto = { guestId: 'guest123' };
      const req = { user: { id: 'user123' } };

      const result = await controller.mergeGuestCart(dto, req);

      expect(service.mergeGuestCart).toHaveBeenCalledWith(dto, 'user123');
      expect(result).toBe(mockCart);
    });
  });

  describe('moveToWishlist', () => {
    it('should delegate to cartService.moveToWishlist', async () => {
      const mockCart = { items: [], grandTotal: 0 };
      service.moveToWishlist.mockResolvedValue(mockCart as any);

      const req = { user: { id: 'user123' } };
      const result = await controller.moveToWishlist('NIA-SKU1', req);

      expect(service.moveToWishlist).toHaveBeenCalledWith('NIA-SKU1', 'user123');
      expect(result).toBe(mockCart);
    });
  });
});
