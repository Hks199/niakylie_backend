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
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cart_service_js_1 = require("./cart.service.js");
const add_to_cart_dto_js_1 = require("./dto/add-to-cart.dto.js");
const update_cart_item_dto_js_1 = require("./dto/update-cart-item.dto.js");
const merge_cart_dto_js_1 = require("./dto/merge-cart.dto.js");
const apply_coupon_dto_js_1 = require("./dto/apply-coupon.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
let CartController = class CartController {
    cartService;
    constructor(cartService) {
        this.cartService = cartService;
    }
    extractUserIdAndGuestId(req, guestIdHeader) {
        const userId = req.user?.id || req.user?._id;
        const guestId = guestIdHeader || req.body?.guestId || req.query?.guestId;
        return { userId, guestId };
    }
    async getCart(req, guestIdHeader) {
        const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
        return this.cartService.getCart(userId, guestId);
    }
    async addToCart(dto, req, guestIdHeader) {
        const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
        dto.guestId = dto.guestId || guestId;
        return this.cartService.addToCart(dto, userId);
    }
    async updateItemQuantity(sku, dto, req, guestIdHeader) {
        const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
        dto.guestId = dto.guestId || guestId;
        return this.cartService.updateItemQuantity(sku, dto, userId);
    }
    async removeItem(sku, req, guestIdHeader) {
        const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
        return this.cartService.removeItem(sku, userId, guestId);
    }
    async mergeGuestCart(dto, req) {
        const userId = req.user.id || req.user._id;
        return this.cartService.mergeGuestCart(dto, userId);
    }
    async toggleSaveForLater(sku, req, guestIdHeader) {
        const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
        return this.cartService.toggleSaveForLater(sku, userId, guestId);
    }
    async moveToWishlist(sku, req) {
        const userId = req.user.id || req.user._id;
        return this.cartService.moveToWishlist(sku, userId);
    }
    async applyCoupon(dto, req, guestIdHeader) {
        const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
        dto.guestId = dto.guestId || guestId;
        return this.cartService.applyCoupon(dto, userId);
    }
    async removeCoupon(req, guestIdHeader) {
        const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
        return this.cartService.removeCoupon(userId, guestId);
    }
    async clearCart(req, guestIdHeader) {
        const { userId, guestId } = this.extractUserIdAndGuestId(req, guestIdHeader);
        return this.cartService.clearCart(userId, guestId);
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active shopping cart for customer or guest' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active shopping cart returned' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getCart", null);
__decorate([
    (0, common_1.Post)('items'),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Add item to shopping cart' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Item added to cart successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_to_cart_dto_js_1.AddToCartDto, Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "addToCart", null);
__decorate([
    (0, common_1.Put)('items/:sku'),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update cart item quantity (set 0 to remove item)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cart item quantity updated' }),
    __param(0, (0, common_1.Param)('sku')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_cart_item_dto_js_1.UpdateCartItemDto, Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "updateItemQuantity", null);
__decorate([
    (0, common_1.Delete)('items/:sku'),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove item from shopping cart' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Item removed from cart' }),
    __param(0, (0, common_1.Param)('sku')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Post)('merge'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Merge guest cart into logged-in user cart after login' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Guest cart merged into user account' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [merge_cart_dto_js_1.MergeCartDto, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "mergeGuestCart", null);
__decorate([
    (0, common_1.Patch)('items/:sku/save-for-later'),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle Save For Later status on a cart item' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Item Save For Later status toggled' }),
    __param(0, (0, common_1.Param)('sku')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "toggleSaveForLater", null);
__decorate([
    (0, common_1.Post)('items/:sku/move-to-wishlist'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Move cart item to customer wishlist' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Item moved from cart to user wishlist' }),
    __param(0, (0, common_1.Param)('sku')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "moveToWishlist", null);
__decorate([
    (0, common_1.Post)('apply-coupon'),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Apply promotional coupon code to shopping cart' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coupon applied to cart' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [apply_coupon_dto_js_1.ApplyCouponDto, Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "applyCoupon", null);
__decorate([
    (0, common_1.Delete)('remove-coupon'),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove applied coupon code from shopping cart' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coupon removed from cart' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "removeCoupon", null);
__decorate([
    (0, common_1.Delete)('clear'),
    (0, swagger_1.ApiHeader)({ name: 'x-guest-id', required: false, description: 'Guest ID for unauthenticated users' }),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Clear all items from shopping cart' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shopping cart cleared' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-guest-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "clearCart", null);
exports.CartController = CartController = __decorate([
    (0, swagger_1.ApiTags)('Cart'),
    (0, common_1.Controller)('cart'),
    __metadata("design:paramtypes", [cart_service_js_1.CartService])
], CartController);
//# sourceMappingURL=cart.controller.js.map