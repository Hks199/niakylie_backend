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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const users_service_js_1 = require("./users.service.js");
const s3_service_js_1 = require("../s3/s3.service.js");
const update_profile_dto_js_1 = require("./dto/update-profile.dto.js");
const address_dto_js_1 = require("./dto/address.dto.js");
const notification_preference_dto_js_1 = require("./dto/notification-preference.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const index_js_1 = require("../shared/index.js");
const user_schema_js_1 = require("./schemas/user.schema.js");
let UsersController = class UsersController {
    usersService;
    s3Service;
    constructor(usersService, s3Service) {
        this.usersService = usersService;
        this.s3Service = s3Service;
    }
    async getProfile(user) {
        return user;
    }
    async updateProfile(user, updateDto) {
        return this.usersService.updateProfile(user.id, updateDto);
    }
    async uploadAvatar(user, file) {
        const filePath = await this.s3Service.uploadBuffer(file.buffer, 'avatars', file.originalname, file.mimetype);
        return this.usersService.updateAvatar(user.id, filePath);
    }
    async getAddresses(user) {
        const fullUser = await this.usersService.findById(user.id);
        return fullUser.addresses;
    }
    async addAddress(user, addressDto) {
        return this.usersService.addAddress(user.id, addressDto);
    }
    async updateAddress(user, addressId, addressDto) {
        return this.usersService.updateAddress(user.id, addressId, addressDto);
    }
    async deleteAddress(user, addressId) {
        return this.usersService.deleteAddress(user.id, addressId);
    }
    async getWishlist(user) {
        return this.usersService.getWishlist(user.id);
    }
    async toggleWishlist(user, dto) {
        const userId = user.id;
        const fullUser = await this.usersService.findById(userId);
        const wishlistStr = (fullUser.wishlist || []).map((id) => id.toString());
        const isWishlisted = wishlistStr.includes(dto.productId);
        if (isWishlisted) {
            await this.usersService.removeFromWishlist(userId, dto.productId);
            return { isWishlisted: false, message: 'Removed from wishlist' };
        }
        else {
            await this.usersService.addToWishlist(userId, dto.productId);
            return { isWishlisted: true, message: 'Added to wishlist' };
        }
    }
    async addToWishlist(user, productId) {
        await this.usersService.addToWishlist(user.id, productId);
        return { isWishlisted: true, message: 'Added to wishlist' };
    }
    async removeFromWishlist(user, productId) {
        await this.usersService.removeFromWishlist(user.id, productId);
        return { isWishlisted: false, message: 'Removed from wishlist' };
    }
    async getRecentlyViewed(user) {
        const fullUser = await this.usersService.findById(user.id);
        return fullUser.recentlyViewed;
    }
    async addRecentlyViewed(user, productId) {
        return this.usersService.addRecentlyViewed(user.id, productId);
    }
    async updateNotificationPreferences(user, preferenceDto) {
        return this.usersService.updateNotificationPreferences(user.id, preferenceDto);
    }
    async getWallet(user) {
        const fullUser = await this.usersService.findById(user.id);
        return fullUser.wallet;
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile details returned successfully' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User, update_profile_dto_js_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('profile/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', { storage: (0, multer_1.memoryStorage)() })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload avatar image' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                avatar: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avatar uploaded and updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file format or file size exceeded' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024, message: 'File is too large (max 5MB)' }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Get)('profile/addresses'),
    (0, swagger_1.ApiOperation)({ summary: 'Get address book' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Address book list returned' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAddresses", null);
__decorate([
    (0, common_1.Post)('profile/addresses'),
    (0, swagger_1.ApiOperation)({ summary: 'Add address to address book' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Address added successfully' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User, address_dto_js_1.AddressDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addAddress", null);
__decorate([
    (0, common_1.Put)('profile/addresses/:addressId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update address details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Address updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Address not found' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('addressId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User, String, address_dto_js_1.AddressDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Delete)('profile/addresses/:addressId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete address from address book' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Address deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Address not found' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('addressId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteAddress", null);
__decorate([
    (0, common_1.Get)('profile/wishlist'),
    (0, common_1.Get)('wishlist'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user wishlist' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wishlist items returned successfully' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getWishlist", null);
__decorate([
    (0, common_1.Post)('wishlist/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle product in wishlist' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "toggleWishlist", null);
__decorate([
    (0, common_1.Post)('profile/wishlist/:productId'),
    (0, common_1.Post)('wishlist/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Add product to wishlist' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Product added to wishlist' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addToWishlist", null);
__decorate([
    (0, common_1.Delete)('profile/wishlist/:productId'),
    (0, common_1.Delete)('wishlist/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove product from wishlist' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product removed from wishlist' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeFromWishlist", null);
__decorate([
    (0, common_1.Get)('profile/recently-viewed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recently viewed products list' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recently viewed items list returned' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getRecentlyViewed", null);
__decorate([
    (0, common_1.Post)('profile/recently-viewed/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Log product viewed interaction' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Viewed history item saved' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addRecentlyViewed", null);
__decorate([
    (0, common_1.Patch)('profile/notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Update notification preference triggers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification preference flags updated' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User,
        notification_preference_dto_js_1.UpdateNotificationPreferenceDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateNotificationPreferences", null);
__decorate([
    (0, common_1.Get)('profile/wallet'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current wallet balance and history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet ledger details returned' }),
    __param(0, (0, index_js_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_schema_js_1.User]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getWallet", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_js_1.UsersService,
        s3_service_js_1.S3Service])
], UsersController);
//# sourceMappingURL=users.controller.js.map