import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CartRepository } from './repositories/cart.repository.js';
import { ProductsRepository } from '../products/repositories/products.repository.js';
import { InventoryRepository } from '../inventory/repositories/inventory.repository.js';
import { UsersRepository } from '../users/repositories/users.repository.js';
import { CouponsService } from '../coupons/coupons.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';
import { MergeCartDto } from './dto/merge-cart.dto.js';
import { ApplyCouponDto } from './dto/apply-coupon.dto.js';
import { CartDocument } from './schemas/cart.schema.js';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly couponsService?: CouponsService,
  ) {}

  private recalculateCart(cart: CartDocument): CartDocument {
    let subtotal = 0;
    let totalMrp = 0;

    for (const item of cart.items) {
      if (!item.isSavedForLater) {
        subtotal += item.unitPrice * item.quantity;
        totalMrp += item.unitMrp * item.quantity;
      }
    }

    const totalDiscount = Math.max(0, totalMrp - subtotal);

    // Calculate coupon discount
    let couponDiscount = cart.couponDiscount || 0;
    if (cart.couponCode) {
      const code = cart.couponCode.toUpperCase().trim();
      if (code === 'FLAT100' || code === 'OFF100' || code === 'PROMO100') {
        couponDiscount = Math.min(100, subtotal);
      } else if (code === 'FLAT500') {
        couponDiscount = Math.min(500, subtotal);
      } else if (code === 'WELCOME10') {
        couponDiscount = Math.round(subtotal * 0.1);
      } else if (code === 'FESTIVE50') {
        couponDiscount = Math.round(subtotal * 0.5);
      } else if (code === 'FESTIVE20') {
        couponDiscount = Math.round(subtotal * 0.2);
      } else if (code === 'ROYAL1000') {
        couponDiscount = subtotal >= 4999 ? 1000 : 0;
      }
    } else {
      couponDiscount = 0;
    }

    cart.couponDiscount = couponDiscount;
    cart.subtotal = subtotal;
    cart.totalMrp = totalMrp;
    cart.totalDiscount = totalDiscount;

    // 0% Tax
    cart.tax = 0;

    // Free shipping threshold: subtotal >= 1000
    cart.shippingFee = subtotal >= 1000 || subtotal === 0 ? 0 : 99;

    cart.grandTotal = Math.max(0, subtotal - couponDiscount + cart.shippingFee);

    return cart;
  }

  async getCart(userId?: string, guestId?: string): Promise<CartDocument> {
    if (!userId && !guestId) {
      throw new BadRequestException('Either userId or guestId header must be provided');
    }
    const cart = await this.cartRepository.findOrCreateCart(userId, guestId);
    this.recalculateCart(cart);
    return cart.save();
  }

  async addToCart(dto: AddToCartDto, userId?: string): Promise<CartDocument> {
    const guestId = dto.guestId;
    if (!userId && !guestId) {
      throw new BadRequestException('Either userId or guestId must be provided');
    }

    const product = await this.productsRepository.findById(dto.productId);
    if (!product || product.isDeleted || !product.status) {
      throw new NotFoundException(`Product with ID '${dto.productId}' not found or inactive`);
    }

    let variant = dto.sku ? product.variants.find((v) => v.sku === dto.sku) : undefined;
    if (!variant && dto.variantId) {
      variant = product.variants.find((v) => (v._id as any)?.toString() === dto.variantId);
    }
    if (!variant && (dto.size || dto.color)) {
      variant = product.variants.find(
        (v) => (dto.size ? v.size === dto.size : true) && (dto.color ? v.color === dto.color : true),
      );
    }
    if (!variant && product.variants?.length > 0) {
      variant = product.variants[0];
    }
    if (!variant) {
      throw new NotFoundException(`Variant not found for product '${dto.productId}'`);
    }

    const targetSku = variant.sku || dto.sku || `SKU-${variant._id}`;

    // Check inventory stock availability
    const inventory = await this.inventoryRepository.findBySku(targetSku);
    const availableStock = inventory ? inventory.availableStock : variant.stock;
    if (availableStock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock for SKU '${targetSku}'. Requested: ${dto.quantity}, Available: ${availableStock}`,
      );
    }

    const cart = await this.cartRepository.findOrCreateCart(userId, guestId);
    const existingIndex = cart.items.findIndex(
      (item) => item.sku === targetSku && !item.isSavedForLater,
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + dto.quantity;
      if (availableStock < newQty) {
        throw new BadRequestException(
          `Cannot add item. Maximum available stock for SKU '${targetSku}' is ${availableStock}`,
        );
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      const image = variant.images?.[0] || product.images?.[0] || '';
      const productName = product.name || (product as any).title || 'Fashion Garment';
      cart.items.push({
        productId: product._id as Types.ObjectId,
        variantId: variant._id as Types.ObjectId,
        sku: targetSku,
        name: productName,
        quantity: dto.quantity,
        unitPrice: variant.offerPrice,
        unitMrp: variant.mrp,
        color: variant.color,
        size: variant.size,
        image,
        isSavedForLater: false,
      });
    }

    this.recalculateCart(cart);
    await cart.save();
    return this.getCart(userId, guestId);
  }

  async updateItemQuantity(
    sku: string,
    dto: UpdateCartItemDto,
    userId?: string,
  ): Promise<CartDocument> {
    const guestId = dto.guestId;
    const cart = await this.cartRepository.findCart(userId, guestId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex((item) => item.sku === sku);
    if (itemIndex === -1) {
      throw new NotFoundException(`Item with SKU '${sku}' not found in cart`);
    }

    if (dto.quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const inventory = await this.inventoryRepository.findBySku(sku);
      if (inventory && inventory.availableStock < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock for SKU '${sku}'. Requested: ${dto.quantity}, Available: ${inventory.availableStock}`,
        );
      }
      cart.items[itemIndex].quantity = dto.quantity;
    }

    this.recalculateCart(cart);
    return cart.save();
  }

  async removeItem(sku: string, userId?: string, guestId?: string): Promise<CartDocument> {
    const cart = await this.cartRepository.findCart(userId, guestId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter((item) => item.sku !== sku);
    this.recalculateCart(cart);
    return cart.save();
  }

  async mergeGuestCart(dto: MergeCartDto, userId: string): Promise<CartDocument> {
    const guestCart = await this.cartRepository.findByGuestId(dto.guestId);
    if (!guestCart || !guestCart.items.length) {
      return this.getCart(userId);
    }

    const userCart = await this.cartRepository.findOrCreateCart(userId);

    for (const guestItem of guestCart.items) {
      const userItemIndex = userCart.items.findIndex((item) => item.sku === guestItem.sku);
      if (userItemIndex > -1) {
        userCart.items[userItemIndex].quantity += guestItem.quantity;
      } else {
        userCart.items.push(guestItem);
      }
    }

    this.recalculateCart(userCart);
    await userCart.save();

    // Delete merged guest cart
    await this.cartRepository.delete(guestCart._id.toString());

    return userCart;
  }

  async toggleSaveForLater(sku: string, userId?: string, guestId?: string): Promise<CartDocument> {
    const cart = await this.cartRepository.findCart(userId, guestId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find((i) => i.sku === sku);
    if (!item) {
      throw new NotFoundException(`Item with SKU '${sku}' not found in cart`);
    }

    item.isSavedForLater = !item.isSavedForLater;
    this.recalculateCart(cart);
    return cart.save();
  }

  async moveToWishlist(sku: string, userId: string): Promise<CartDocument> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex((i) => i.sku === sku);
    if (itemIndex === -1) {
      throw new NotFoundException(`Item with SKU '${sku}' not found in cart`);
    }

    const [item] = cart.items.splice(itemIndex, 1);

    // Add to user wishlist
    await this.usersRepository.addToWishlist(userId, item.productId.toString());

    this.recalculateCart(cart);
    return cart.save();
  }

  async applyCoupon(dto: ApplyCouponDto, userId?: string): Promise<CartDocument> {
    const cart = await this.cartRepository.findCart(userId, dto.guestId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.items.length) {
      throw new BadRequestException('Cannot apply coupon to an empty cart');
    }

    this.recalculateCart(cart);

    if (this.couponsService) {
      const validation = await this.couponsService.validateCoupon({
        code: dto.couponCode,
        subtotal: cart.subtotal,
        userId,
        items: cart.items.map((i) => ({
          productId: i.productId.toString(),
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });
      cart.couponCode = validation.code;
      cart.couponDiscount = validation.discountAmount;
    } else {
      cart.couponCode = dto.couponCode.toUpperCase().trim();
    }

    this.recalculateCart(cart);
    return cart.save();
  }

  async removeCoupon(userId?: string, guestId?: string): Promise<CartDocument> {
    const cart = await this.cartRepository.findCart(userId, guestId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.couponCode = undefined;
    cart.couponDiscount = 0;
    this.recalculateCart(cart);
    return cart.save();
  }

  async clearCart(userId?: string, guestId?: string): Promise<CartDocument | null> {
    const cart = await this.cartRepository.findCart(userId, guestId);
    if (!cart) {
      return null;
    }
    await this.cartRepository.clearCart(userId, guestId);
    return null;
  }
}
