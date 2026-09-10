import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersRepository } from './repositories/users.repository.js';
import { UserDocument } from './schemas/user.schema.js';
import { Order, OrderDocument, OrderStatus } from '../checkout/schemas/order.schema.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create(userData: Partial<import('./schemas/user.schema.js').User>): Promise<UserDocument> {
    return this.usersRepository.create(userData);
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string, includePassword = false): Promise<UserDocument | null> {
    return this.usersRepository.findByEmail(email, includePassword);
  }

  async findAll(options?: { page?: number; limit?: number; search?: string; isActive?: boolean }) {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(100, Math.max(1, options?.limit || 10));
    const result = await this.usersRepository.findAll({ ...options, page, limit });
    const userIds = result.data.map((user) => user._id as Types.ObjectId);
    const orderStats = userIds.length
      ? await this.orderModel.aggregate<{ _id: Types.ObjectId; orderCount: number; totalSpent: number }>([
          {
            $match: {
              userId: { $in: userIds },
              orderStatus: { $ne: OrderStatus.CANCELLED },
            },
          },
          {
            $group: {
              _id: '$userId',
              orderCount: { $sum: 1 },
              totalSpent: { $sum: { $ifNull: ['$pricing.grandTotal', 0] } },
            },
          },
        ])
      : [];
    const statsByUserId = new Map(orderStats.map((stats) => [stats._id.toString(), stats]));

    return {
      users: result.data.map((user: any) => ({
        // Delivery-phone data belongs to the embedded address, not user.phone.
        // Prefer the default address, then fall back to the first saved address.
        ...(function () {
          const address = user.addresses?.find((item: any) => item.isDefault) || user.addresses?.[0];
          const stats = statsByUserId.get(user._id.toString());
          return {
            phone: address?.phone || user.phone,
            orderCount: stats?.orderCount || 0,
            totalSpent: stats?.totalSpent || 0,
          };
        })(),
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      total: result.total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(result.total / limit)),
    };
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.usersRepository.findByGoogleId(googleId);
  }

  async update(id: string, updateData: Partial<import('./schemas/user.schema.js').User>): Promise<UserDocument> {
    const user = await this.usersRepository.update(id, updateData);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // --- Profile Operations ---

  async updateProfile(id: string, updateDto: import('./dto/update-profile.dto.js').UpdateProfileDto): Promise<UserDocument> {
    return this.update(id, updateDto);
  }

  async updateAvatar(id: string, filePath: string): Promise<UserDocument> {
    return this.update(id, { avatar: filePath });
  }

  // --- Address Book Operations ---

  async addAddress(userId: string, addressDto: import('./dto/address.dto.js').AddressDto): Promise<UserDocument> {
    const user = await this.findById(userId);
    const newAddress = {
      ...addressDto,
      isDefault: addressDto.isDefault || user.addresses.length === 0, // Mark first address as default
    };

    if (newAddress.isDefault) {
      await this.usersRepository.resetDefaultAddresses(userId);
    }

    const updatedUser = await this.usersRepository.addAddress(userId, newAddress as any);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return updatedUser;
  }

  async updateAddress(
    userId: string,
    addressId: string,
    addressDto: import('./dto/address.dto.js').AddressDto,
  ): Promise<UserDocument> {
    const user = await this.findById(userId);
    const addressExists = user.addresses.some((a) => (a as any)._id.toString() === addressId);
    if (!addressExists) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    if (addressDto.isDefault) {
      await this.usersRepository.resetDefaultAddresses(userId);
    }

    const updatedUser = await this.usersRepository.updateAddress(userId, addressId, addressDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return updatedUser;
  }

  async deleteAddress(userId: string, addressId: string): Promise<UserDocument> {
    const user = await this.findById(userId);
    const addressExists = user.addresses.some((a) => (a as any)._id.toString() === addressId);
    if (!addressExists) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    const targetAddress = user.addresses.find((a) => (a as any)._id.toString() === addressId);
    const updatedUser = await this.usersRepository.deleteAddress(userId, addressId);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // If we deleted the default address, assign default to another address if available
    if (targetAddress?.isDefault && updatedUser.addresses.length > 0) {
      const firstAddressId = (updatedUser.addresses[0] as any)._id.toString();
      await this.usersRepository.updateAddress(userId, firstAddressId, { isDefault: true });
      return this.findById(userId);
    }

    return updatedUser;
  }

  // --- Wishlist Operations ---

  async getWishlist(userId: string): Promise<any[]> {
    return this.usersRepository.getWishlist(userId);
  }

  async addToWishlist(userId: string, productId: string): Promise<UserDocument> {
    const updatedUser = await this.usersRepository.addToWishlist(userId, productId);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found or invalid product ID`);
    }
    return updatedUser;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<UserDocument> {
    const updatedUser = await this.usersRepository.removeFromWishlist(userId, productId);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found or invalid product ID`);
    }
    return updatedUser;
  }

  // --- Recently Viewed Operations ---

  async addRecentlyViewed(userId: string, productId: string): Promise<UserDocument> {
    const updatedUser = await this.usersRepository.addRecentlyViewed(userId, productId);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found or invalid product ID`);
    }
    return updatedUser;
  }

  // --- Notification Preferences ---

  async updateNotificationPreferences(
    userId: string,
    preferenceDto: import('./dto/notification-preference.dto.js').UpdateNotificationPreferenceDto,
  ): Promise<UserDocument> {
    const user = await this.findById(userId);
    const newPreferences = {
      ...user.notificationPreferences,
      ...preferenceDto,
    };

    const updatedUser = await this.update(userId, {
      notificationPreferences: newPreferences,
    });
    return updatedUser;
  }

  // --- Wallet Operations ---

  async creditWallet(userId: string, amount: number, reason: string): Promise<UserDocument> {
    if (amount <= 0) {
      throw new BadRequestException('Credit amount must be greater than zero');
    }
    const updatedUser = await this.usersRepository.updateWalletBalance(userId, amount, {
      amount,
      type: 'credit',
      reason,
    });
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return updatedUser;
  }

  async debitWallet(userId: string, amount: number, reason: string): Promise<UserDocument> {
    if (amount <= 0) {
      throw new BadRequestException('Debit amount must be greater than zero');
    }
    const user = await this.findById(userId);
    if (user.wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const updatedUser = await this.usersRepository.updateWalletBalance(userId, -amount, {
      amount,
      type: 'debit',
      reason,
    });
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return updatedUser;
  }
}

