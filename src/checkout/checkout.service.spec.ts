import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { CheckoutService } from './checkout.service.js';
import { OrdersRepository } from './repositories/orders.repository.js';
import { CartRepository } from '../cart/repositories/cart.repository.js';
import { InventoryRepository } from '../inventory/repositories/inventory.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { CouponsService } from '../coupons/coupons.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { OnlinePaymentDiscountService } from '../payment/online-payment-discount.service.js';
import { PaymentMethod, ShippingMethod, OrderStatus } from './schemas/order.schema.js';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let ordersRepo: jest.Mocked<OrdersRepository>;
  let cartRepo: jest.Mocked<CartRepository>;
  let inventoryRepo: jest.Mocked<InventoryRepository>;
  let productsRepo: jest.Mocked<ProductsRepository>;
  let usersRepo: jest.Mocked<UsersRepository>;
  let couponsService: jest.Mocked<CouponsService>;

  const productId = new Types.ObjectId('60d5ecb8b392d40015f8a001');
  const variantId = new Types.ObjectId('60d5ecb8b392d40015f8a002');
  const userId = new Types.ObjectId('60d5ecb8b392d40015f8a003');

  const mockCart = {
    _id: new Types.ObjectId('60d5ecb8b392d40015f8a010'),
    userId,
    items: [
      {
        productId,
        variantId,
        sku: 'NIA-SAREE01',
        quantity: 2,
        unitPrice: 1000,
        unitMrp: 1500,
        color: 'Red',
        size: 'M',
        image: 'img.jpg',
        isSavedForLater: false,
      },
    ],
    couponCode: 'WELCOME10',
    couponDiscount: 200,
    subtotal: 2000,
    totalMrp: 3000,
    totalDiscount: 1000,
    tax: 324,
    shippingFee: 0,
    grandTotal: 2124,
  };

  const mockShippingAddress = {
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    phone: '+919876543210',
  };

  const mockUser = {
    _id: userId,
    email: 'user@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
  };

  const mockOrder = {
    _id: new Types.ObjectId('60d5ecb8b392d40015f8a020'),
    orderNumber: 'NK-ORD-20260807-1234',
    invoiceNumber: 'NK-INV-2026-1234',
    userId,
    customerInfo: {
      email: 'user@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+919876543210',
    },
    shippingAddress: mockShippingAddress,
    billingAddress: mockShippingAddress,
    items: [
      {
        productId,
        variantId,
        sku: 'NIA-SAREE01',
        name: 'Silk Saree',
        quantity: 2,
        unitPrice: 1000,
        unitMrp: 1500,
        totalPrice: 2000,
      },
    ],
    paymentInfo: { method: PaymentMethod.COD, status: 'PENDING' },
    shippingInfo: { method: ShippingMethod.STANDARD, fee: 0 },
    pricing: {
      subtotal: 2000,
      totalMrp: 3000,
      totalDiscount: 1000,
      couponCode: 'WELCOME10',
      couponDiscount: 200,
      tax: 324,
      shippingFee: 0,
      grandTotal: 2124,
    },
    orderStatus: OrderStatus.CONFIRMED,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockOrdersRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOrderNumber: jest.fn(),
      findByInvoiceNumber: jest.fn(),
      findByUserId: jest.fn(),
      findByGuestId: jest.fn(),
      updateStatus: jest.fn(),
    };

    const mockCartRepo = {
      findCart: jest.fn(),
      clearCart: jest.fn(),
    };

    const mockInventoryRepo = {
      findBySku: jest.fn(),
      updateBySku: jest.fn(),
    };

    const mockProductsRepo = {
      findById: jest.fn(),
      decrementVariantStock: jest.fn().mockResolvedValue(undefined),
    };

    const mockUsersRepo = {
      findById: jest.fn(),
    };

    const mockCouponsService = {
      validateCoupon: jest.fn(),
      findByCode: jest.fn(),
      recordUsage: jest.fn(),
    };

    const mockNotificationsService = {
      sendOrderUpdateNotification: jest.fn().mockResolvedValue(undefined),
      sendAdminEventNotification: jest.fn().mockResolvedValue(undefined),
      sendNotification: jest.fn().mockResolvedValue(undefined),
    };

    const mockOnlineDiscountService = {
      getConfig: jest.fn().mockResolvedValue({ isEnabled: false }),
      updateConfig: jest.fn(),
      calculateDiscount: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: OrdersRepository, useValue: mockOrdersRepo },
        { provide: CartRepository, useValue: mockCartRepo },
        { provide: InventoryRepository, useValue: mockInventoryRepo },
        { provide: ProductsRepository, useValue: mockProductsRepo },
        { provide: UsersRepository, useValue: mockUsersRepo },
        { provide: CouponsService, useValue: mockCouponsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: OnlinePaymentDiscountService, useValue: mockOnlineDiscountService },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    ordersRepo = module.get(OrdersRepository);
    cartRepo = module.get(CartRepository);
    inventoryRepo = module.get(InventoryRepository);
    productsRepo = module.get(ProductsRepository);
    usersRepo = module.get(UsersRepository);
    couponsService = module.get(CouponsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCheckoutSummary', () => {
    it('should throw BadRequestException if cart is empty', async () => {
      cartRepo.findCart.mockResolvedValue(null);

      await expect(service.getCheckoutSummary('user123')).rejects.toThrow(BadRequestException);
    });

    it('should compute pricing, shipping fee, tax, and stock status correctly', async () => {
      cartRepo.findCart.mockResolvedValue(mockCart as any);
      productsRepo.findById.mockResolvedValue({ name: 'Silk Saree' } as any);
      inventoryRepo.findBySku.mockResolvedValue({ availableStock: 10 } as any);
      couponsService.validateCoupon.mockResolvedValue({
        code: 'WELCOME10',
        discountAmount: 200,
      } as any);

      const result = await service.getCheckoutSummary(userId.toString());

      expect(result.pricing.subtotal).toBe(2000);
      expect(result.pricing.totalMrp).toBe(3000);
      // Tax is currently 0%
      expect(result.pricing.tax).toBe(0);
      // Subtotal >= 1000 -> Free Shipping
      expect(result.pricing.shippingFee).toBe(0);
      // grandTotal = subtotal - coupon + shipping = 2000 - 200 + 0 = 1800
      expect(result.pricing.grandTotal).toBe(1800);
      expect(result.isCheckoutReady).toBe(true);
    });
  });

  describe('placeOrder', () => {
    it('should place order, deduct stock, and clear cart', async () => {
      cartRepo.findCart.mockResolvedValue(mockCart as any);
      productsRepo.findById.mockResolvedValue({ name: 'Silk Saree' } as any);
      inventoryRepo.findBySku.mockResolvedValue({
        availableStock: 10,
        totalStock: 10,
        soldStock: 0,
        lowStockThreshold: 5,
      } as any);
      couponsService.validateCoupon.mockResolvedValue({ code: 'WELCOME10', discountAmount: 200 } as any);
      usersRepo.findById.mockResolvedValue(mockUser as any);
      ordersRepo.create.mockResolvedValue(mockOrder as any);

      const result = await service.placeOrder(userId.toString(), {
        shippingAddress: mockShippingAddress,
        paymentMethod: PaymentMethod.COD,
      });

      expect(ordersRepo.create).toHaveBeenCalled();
      expect(inventoryRepo.updateBySku).toHaveBeenCalledWith('NIA-SAREE01', {
        totalStock: 8,
        availableStock: 8,
        soldStock: 2,
        status: 'IN_STOCK',
      });
      expect(productsRepo.decrementVariantStock).toHaveBeenCalled();
      expect(cartRepo.clearCart).toHaveBeenCalledWith(userId.toString(), undefined);
      expect(result).toBe(mockOrder);
    });
  });

  describe('getInvoice', () => {
    it('should return invoice metadata and HTML template', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue(mockOrder as any);

      const invoice = await service.getInvoice('NK-ORD-20260807-1234');

      expect(invoice.orderNumber).toBe('NK-ORD-20260807-1234');
      expect(invoice.invoiceNumber).toBe('NK-INV-2026-1234');
      expect(invoice.htmlTemplate).toContain('NK-INV-2026-1234');
    });

    it('should throw NotFoundException if order does not exist', async () => {
      ordersRepo.findByOrderNumber.mockResolvedValue(null);

      await expect(service.getInvoice('INVALID')).rejects.toThrow(NotFoundException);
    });
  });
});
