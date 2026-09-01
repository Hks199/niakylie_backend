import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema.js';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(user: Partial<User>): Promise<UserDocument> {
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.userModel.findById(id).exec();
  }

  async findAll(options?: { page?: number; limit?: number }): Promise<{ data: UserDocument[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 100;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return { data, total };
  }

  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email });
    if (includePassword) {
      query.select('+password +refreshTokens');
    }
    return query.exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findByVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      })
      .select('+emailVerificationToken +emailVerificationExpires')
      .exec();
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      })
      .select('+passwordResetToken +passwordResetExpires')
      .exec();
  }

  async update(
    id: string,
    updateData: UpdateQuery<UserDocument>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async addRefreshToken(id: string, token: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, {
        $push: { refreshTokens: token },
      })
      .exec();
  }

  async removeRefreshToken(id: string, token: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, {
        $pull: { refreshTokens: token },
      })
      .exec();
  }

  async clearRefreshTokens(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, {
        $set: { refreshTokens: [] },
      })
      .exec();
  }

  // --- Address Book Operations ---

  async addAddress(userId: string, address: import('../schemas/address.schema.js').Address): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $push: { addresses: address } },
        { new: true },
      )
      .exec();
  }

  async resetDefaultAddresses(userId: string): Promise<void> {
    await this.userModel
      .updateOne(
        { _id: userId },
        { $set: { 'addresses.$[].isDefault': false } },
      )
      .exec();
  }

  async updateAddress(
    userId: string,
    addressId: string,
    addressData: Partial<import('../schemas/address.schema.js').Address>,
  ): Promise<UserDocument | null> {
    const updateFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(addressData)) {
      updateFields[`addresses.$.${key}`] = value;
    }

    return this.userModel
      .findOneAndUpdate(
        { _id: userId, 'addresses._id': new Types.ObjectId(addressId) },
        { $set: updateFields },
        { new: true },
      )
      .exec();
  }

  async deleteAddress(userId: string, addressId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { addresses: { _id: new Types.ObjectId(addressId) } } },
        { new: true },
      )
      .exec();
  }

  // --- Wishlist Operations ---

  async getWishlist(userId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const user = await this.userModel
      .findById(userId)
      .populate({
        path: 'wishlist',
        match: { isDeleted: { $ne: true } },
      })
      .exec();

    if (!user || !user.wishlist) return [];
    return user.wishlist.filter((item: any) => item && typeof item === 'object' && item._id);
  }

  async addToWishlist(userId: string, productId: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(productId)) return null;
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: new Types.ObjectId(productId) } },
        { new: true },
      )
      .exec();
  }

  async removeFromWishlist(userId: string, productId: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(productId)) return null;
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { wishlist: new Types.ObjectId(productId) } },
        { new: true },
      )
      .exec();
  }

  // --- Recently Viewed Operations ---

  async addRecentlyViewed(userId: string, productId: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(productId)) return null;

    // Pull duplicate to move to front
    await this.userModel
      .findByIdAndUpdate(userId, {
        $pull: { recentlyViewed: { productId: new Types.ObjectId(productId) } },
      })
      .exec();

    // Push to index 0, slice to 10
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $push: {
            recentlyViewed: {
              $each: [{ productId: new Types.ObjectId(productId), viewedAt: new Date() }],
              $position: 0,
              $slice: 10,
            },
          },
        },
        { new: true },
      )
      .exec();
  }

  // --- Wallet Operations ---

  async updateWalletBalance(
    userId: string,
    amount: number,
    transaction: { amount: number; type: 'credit' | 'debit'; reason: string },
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $inc: { 'wallet.balance': amount },
          $push: { 'wallet.history': { ...transaction, createdAt: new Date() } },
        },
        { new: true },
      )
      .exec();
  }

  async incrementRewardPoints(userId: string, points: number): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $inc: { rewardPoints: points } },
        { new: true },
      )
      .exec();
  }
}
