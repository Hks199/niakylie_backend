import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository.js';
import { UserDocument } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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

