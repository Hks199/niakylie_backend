"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const users_repository_js_1 = require("./repositories/users.repository.js");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(userData) {
        return this.usersRepository.create(userData);
    }
    async findById(id) {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email, includePassword = false) {
        return this.usersRepository.findByEmail(email, includePassword);
    }
    async findAll(options) {
        const page = Math.max(1, options?.page || 1);
        const limit = Math.min(100, Math.max(1, options?.limit || 10));
        const result = await this.usersRepository.findAll({ ...options, page, limit });
        return {
            users: result.data.map((user) => ({
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
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
    async findByGoogleId(googleId) {
        return this.usersRepository.findByGoogleId(googleId);
    }
    async update(id, updateData) {
        const user = await this.usersRepository.update(id, updateData);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async updateProfile(id, updateDto) {
        return this.update(id, updateDto);
    }
    async updateAvatar(id, filePath) {
        return this.update(id, { avatar: filePath });
    }
    async addAddress(userId, addressDto) {
        const user = await this.findById(userId);
        const newAddress = {
            ...addressDto,
            isDefault: addressDto.isDefault || user.addresses.length === 0,
        };
        if (newAddress.isDefault) {
            await this.usersRepository.resetDefaultAddresses(userId);
        }
        const updatedUser = await this.usersRepository.addAddress(userId, newAddress);
        if (!updatedUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return updatedUser;
    }
    async updateAddress(userId, addressId, addressDto) {
        const user = await this.findById(userId);
        const addressExists = user.addresses.some((a) => a._id.toString() === addressId);
        if (!addressExists) {
            throw new common_1.NotFoundException(`Address with ID ${addressId} not found`);
        }
        if (addressDto.isDefault) {
            await this.usersRepository.resetDefaultAddresses(userId);
        }
        const updatedUser = await this.usersRepository.updateAddress(userId, addressId, addressDto);
        if (!updatedUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return updatedUser;
    }
    async deleteAddress(userId, addressId) {
        const user = await this.findById(userId);
        const addressExists = user.addresses.some((a) => a._id.toString() === addressId);
        if (!addressExists) {
            throw new common_1.NotFoundException(`Address with ID ${addressId} not found`);
        }
        const targetAddress = user.addresses.find((a) => a._id.toString() === addressId);
        const updatedUser = await this.usersRepository.deleteAddress(userId, addressId);
        if (!updatedUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        if (targetAddress?.isDefault && updatedUser.addresses.length > 0) {
            const firstAddressId = updatedUser.addresses[0]._id.toString();
            await this.usersRepository.updateAddress(userId, firstAddressId, { isDefault: true });
            return this.findById(userId);
        }
        return updatedUser;
    }
    async getWishlist(userId) {
        return this.usersRepository.getWishlist(userId);
    }
    async addToWishlist(userId, productId) {
        const updatedUser = await this.usersRepository.addToWishlist(userId, productId);
        if (!updatedUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found or invalid product ID`);
        }
        return updatedUser;
    }
    async removeFromWishlist(userId, productId) {
        const updatedUser = await this.usersRepository.removeFromWishlist(userId, productId);
        if (!updatedUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found or invalid product ID`);
        }
        return updatedUser;
    }
    async addRecentlyViewed(userId, productId) {
        const updatedUser = await this.usersRepository.addRecentlyViewed(userId, productId);
        if (!updatedUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found or invalid product ID`);
        }
        return updatedUser;
    }
    async updateNotificationPreferences(userId, preferenceDto) {
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
    async creditWallet(userId, amount, reason) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Credit amount must be greater than zero');
        }
        const updatedUser = await this.usersRepository.updateWalletBalance(userId, amount, {
            amount,
            type: 'credit',
            reason,
        });
        if (!updatedUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return updatedUser;
    }
    async debitWallet(userId, amount, reason) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Debit amount must be greater than zero');
        }
        const user = await this.findById(userId);
        if (user.wallet.balance < amount) {
            throw new common_1.BadRequestException('Insufficient wallet balance');
        }
        const updatedUser = await this.usersRepository.updateWalletBalance(userId, -amount, {
            amount,
            type: 'debit',
            reason,
        });
        if (!updatedUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return updatedUser;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_js_1.UsersRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map