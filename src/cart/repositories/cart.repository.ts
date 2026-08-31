import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema.js';

@Injectable()
export class CartRepository {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
  ) {}

  async create(data: Partial<Cart>): Promise<CartDocument> {
    const cart = new this.cartModel(data);
    return cart.save();
  }

  async findByUserId(userId: string): Promise<CartDocument | null> {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.productId', 'name slug images status isDeleted')
      .exec();
  }

  async findByGuestId(guestId: string): Promise<CartDocument | null> {
    return this.cartModel
      .findOne({ guestId })
      .populate('items.productId', 'name slug images status isDeleted')
      .exec();
  }

  async findCart(userId?: string, guestId?: string): Promise<CartDocument | null> {
    if (userId && Types.ObjectId.isValid(userId)) {
      const userCart = await this.findByUserId(userId);
      if (userCart) return userCart;
    }
    if (guestId) {
      return this.findByGuestId(guestId);
    }
    return null;
  }

  async findOrCreateCart(userId?: string, guestId?: string): Promise<CartDocument> {
    let cart = await this.findCart(userId, guestId);
    if (cart) {
      // If user is logged in but cart currently has no userId (was created as guest), assign userId to claim it!
      if (userId && Types.ObjectId.isValid(userId) && !cart.userId) {
        cart.userId = new Types.ObjectId(userId);
        await cart.save();
      }
      return cart;
    }

    const initData: Partial<Cart> = { items: [] };
    if (userId && Types.ObjectId.isValid(userId)) {
      initData.userId = new Types.ObjectId(userId);
      if (guestId) initData.guestId = guestId;
    } else if (guestId) {
      initData.guestId = guestId;
    }
    return this.create(initData);
  }

  async update(id: string, updateData: UpdateQuery<CartDocument>): Promise<CartDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.cartModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('items.productId', 'name slug images status isDeleted')
      .exec();
  }

  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this.cartModel.findByIdAndDelete(id).exec();
  }

  async clearCart(userId?: string, guestId?: string): Promise<CartDocument | null> {
    const cart = await this.findCart(userId, guestId);
    if (!cart) return null;
    return this.update(cart._id.toString(), {
      items: [],
      couponCode: undefined,
      couponDiscount: 0,
      subtotal: 0,
      totalMrp: 0,
      totalDiscount: 0,
      tax: 0,
      shippingFee: 0,
      grandTotal: 0,
    });
  }
}
