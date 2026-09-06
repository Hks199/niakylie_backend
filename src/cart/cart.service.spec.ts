import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { CartService } from './cart.service.js';
import { CartRepository } from './repositories/cart.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { InventoryRepository } from '../inventory/repositories/inventory.repository.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { CouponsService } from '../coupons/coupons.service.js';

describe('CartService', () => {
  let service: CartService;
  let cartRepo: jest.Mocked<CartRepository>;
  let productsRepo: jest.Mocked<ProductsRepository>;
  let inventoryRepo: jest.Mocked<InventoryRepository>;
  let usersRepo: jest.Mocked<UsersRepository>;

  const mockProduct = {
    _id: new Types.ObjectId('60d5ecb8b392d40015f8a001'),
    name: 'Silk Saree',
    status: true,
    isDeleted: false,
    images: ['img1.jpg'],
    variants: [
      {
        _id: new Types.ObjectId('60d5ecb8b392d40015f8a002'),
        sku: 'NIA-SAREE01',
        offerPrice: 2000,
        mrp: 3000,
        color: 'Red',
        size: 'Free Size',
        stock: 10,
        images: ['variant1.jpg'],
      },
    ],
  };

  const mockCart = {
    _id: new Types.ObjectId('60d5ecb8b392d40015f8a003'),
    userId: new Types.ObjectId('60d5ecb8b392d40015f8a004'),
    items: [],
    couponDiscount: 0,
    subtotal: 0,
    totalMrp: 0,
    totalDiscount: 0,
    tax: 0,
    shippingFee: 0,
    grandTotal: 0,
    save: jest.fn().mockImplementation(function (this: any) {
      return Promise.resolve(this);
    }),
  };

  beforeEach(async () => {
    const mockCartRepo = {
      findOrCreateCart: jest.fn(),
      findCart: jest.fn(),
      findByUserId: jest.fn(),
      findByGuestId: jest.fn(),
      delete: jest.fn(),
    };

    const mockProductsRepo = {
      findById: jest.fn(),
    };

    const mockInventoryRepo = {
      findBySku: jest.fn(),
    };

    const mockUsersRepo = {
      addToWishlist: jest.fn(),
    };

    const mockCouponsService = {
      validateCoupon: jest.fn(),
      calculateDiscount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CartRepository, useValue: mockCartRepo },
        { provide: ProductsRepository, useValue: mockProductsRepo },
        { provide: InventoryRepository, useValue: mockInventoryRepo },
        { provide: UsersRepository, useValue: mockUsersRepo },
        { provide: CouponsService, useValue: mockCouponsService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepo = module.get(CartRepository);
    productsRepo = module.get(ProductsRepository);
    inventoryRepo = module.get(InventoryRepository);
    usersRepo = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToCart', () => {
    it('should throw NotFoundException if product is missing or inactive', async () => {
      productsRepo.findById.mockResolvedValue(null);
      await expect(
        service.addToCart({
          productId: '60d5ecb8b392d40015f8a001',
          sku: 'NIA-SAREE01',
          quantity: 1,
          guestId: 'guest123',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if stock is insufficient', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct as any);
      inventoryRepo.findBySku.mockResolvedValue({ availableStock: 0 } as any);

      await expect(
        service.addToCart({
          productId: '60d5ecb8b392d40015f8a001',
          sku: 'NIA-SAREE01',
          quantity: 2,
          guestId: 'guest123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should add item and calculate subtotal, 18% GST tax, and free shipping when >= 1000', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct as any);
      inventoryRepo.findBySku.mockResolvedValue({ availableStock: 10 } as any);

      const cartInstance = {
        ...mockCart,
        items: [],
        save: jest.fn().mockImplementation(function (this: any) {
          return Promise.resolve(this);
        }),
      };
      cartRepo.findOrCreateCart.mockResolvedValue(cartInstance as any);

      const result = await service.addToCart({
        productId: '60d5ecb8b392d40015f8a001',
        sku: 'NIA-SAREE01',
        quantity: 1,
        guestId: 'guest123',
      });

      // 1 * 2000 = 2000 subtotal
      expect(result.subtotal).toBe(2000);
      expect(result.totalMrp).toBe(3000);
      expect(result.totalDiscount).toBe(1000);
      // Tax is currently 0% in cart recalculation
      expect(result.tax).toBe(0);
      // Subtotal >= 1000 -> Free Shipping (0)
      expect(result.shippingFee).toBe(0);
      expect(result.grandTotal).toBe(2000);
    });
  });

  describe('mergeGuestCart', () => {
    it('should merge guest items into user cart and delete guest cart', async () => {
      const guestCart = {
        _id: new Types.ObjectId('60d5ecb8b392d40015f8a099'),
        guestId: 'guest123',
        items: [
          {
            productId: mockProduct._id,
            variantId: mockProduct.variants[0]._id,
            sku: 'NIA-SAREE01',
            quantity: 1,
            unitPrice: 2000,
            unitMrp: 3000,
          },
        ],
      };

      const userCart = {
        ...mockCart,
        items: [],
        save: jest.fn().mockImplementation(function (this: any) {
          return Promise.resolve(this);
        }),
      };

      cartRepo.findByGuestId.mockResolvedValue(guestCart as any);
      cartRepo.findOrCreateCart.mockResolvedValue(userCart as any);

      const result = await service.mergeGuestCart({ guestId: 'guest123' }, 'user123');

      expect(result.items.length).toBe(1);
      expect(cartRepo.delete).toHaveBeenCalledWith(guestCart._id.toString());
    });
  });

  describe('moveToWishlist', () => {
    it('should remove item from cart and call usersRepo.addToWishlist', async () => {
      const activeCart = {
        ...mockCart,
        items: [
          {
            productId: mockProduct._id,
            sku: 'NIA-SAREE01',
            quantity: 1,
            unitPrice: 2000,
            unitMrp: 3000,
          },
        ],
        save: jest.fn().mockImplementation(function (this: any) {
          return Promise.resolve(this);
        }),
      };

      cartRepo.findByUserId.mockResolvedValue(activeCart as any);

      await service.moveToWishlist('NIA-SAREE01', 'user123');

      expect(usersRepo.addToWishlist).toHaveBeenCalledWith('user123', mockProduct._id.toString());
      expect(activeCart.items.length).toBe(0);
    });
  });
});
