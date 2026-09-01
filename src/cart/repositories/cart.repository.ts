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
    if (!userId) return null;
    const query = Types.ObjectId.isValid(userId)
      ? { $or: [{ userId: new Types.ObjectId(userId) }, { userId: userId }] }
      : { userId: userId };

    return this.cartModel
      .findOne(query)
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
    if (userId) {
      const userCart = await this.findByUserId(userId);
      if (userCart && userCart.items && userCart.items.length > 0) {
        return userCart;
      }
    }
    if (guestId) {
      const guestCart = await this.findByGuestId(guestId);
      if (guestCart && guestCart.items && guestCart.items.length > 0) {
        return guestCart;
      }
    }
    if (userId) {
      return this.findByUserId(userId);
    }
    return null;
  }

  async findOrCreateCart(userId?: string, guestId?: string): Promise<CartDocument> {
    let cart = await this.findCart(userId, guestId);
    if (cart) {
      // If user is logged in but cart currently has no userId (was created as guest), assign userId to claim it!
      if (userId && !cart.userId) {
        cart.userId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : (userId as any);
        await cart.save();
      }
      return cart;
    }

    const initData: Partial<Cart> = { items: [] };
    if (userId) {
      initData.userId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : (userId as any);
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
    await this.cartModel.deleteOne({ _id: cart._id }).exec();
    return null;
  }
}
