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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const cart_repository_js_1 = require("./repositories/cart.repository.js");
const products_repository_js_1 = require("../products/repositories/products.repository.js");
const inventory_repository_js_1 = require("../inventory/repositories/inventory.repository.js");
const users_repository_js_1 = require("../users/repositories/users.repository.js");
const coupons_service_js_1 = require("../coupons/coupons.service.js");
let CartService = class CartService {
    cartRepository;
    productsRepository;
    inventoryRepository;
    usersRepository;
    couponsService;
    constructor(cartRepository, productsRepository, inventoryRepository, usersRepository, couponsService) {
        this.cartRepository = cartRepository;
        this.productsRepository = productsRepository;
        this.inventoryRepository = inventoryRepository;
        this.usersRepository = usersRepository;
        this.couponsService = couponsService;
    }
    recalculateCart(cart) {
        let subtotal = 0;
        let totalMrp = 0;
        for (const item of cart.items) {
            if (!item.isSavedForLater) {
                subtotal += item.unitPrice * item.quantity;
                totalMrp += item.unitMrp * item.quantity;
            }
        }
        const totalDiscount = Math.max(0, totalMrp - subtotal);
        let couponDiscount = 0;
        if (cart.couponCode) {
            const code = cart.couponCode.toUpperCase().trim();
            if (code === 'WELCOME10') {
                couponDiscount = Math.round(subtotal * 0.1);
            }
            else if (code === 'FESTIVE20') {
                couponDiscount = Math.round(subtotal * 0.2);
            }
            else if (code === 'FLAT500') {
                couponDiscount = Math.min(500, subtotal);
            }
            else {
                couponDiscount = Math.round(subtotal * 0.05);
            }
        }
        cart.couponDiscount = couponDiscount;
        cart.subtotal = subtotal;
        cart.totalMrp = totalMrp;
        cart.totalDiscount = totalDiscount;
        const taxableSubtotal = Math.max(0, subtotal - couponDiscount);
        cart.tax = Math.round(taxableSubtotal * 0.18);
        cart.shippingFee = subtotal >= 1000 || subtotal === 0 ? 0 : 99;
        cart.grandTotal = Math.max(0, subtotal - couponDiscount + cart.tax + cart.shippingFee);
        return cart;
    }
    async getCart(userId, guestId) {
        if (!userId && !guestId) {
            throw new common_1.BadRequestException('Either userId or guestId header must be provided');
        }
        const cart = await this.cartRepository.findOrCreateCart(userId, guestId);
        this.recalculateCart(cart);
        return cart.save();
    }
    async addToCart(dto, userId) {
        const guestId = dto.guestId;
        if (!userId && !guestId) {
            throw new common_1.BadRequestException('Either userId or guestId must be provided');
        }
        const product = await this.productsRepository.findById(dto.productId);
        if (!product || product.isDeleted || !product.status) {
            throw new common_1.NotFoundException(`Product with ID '${dto.productId}' not found or inactive`);
        }
        let variant = dto.sku ? product.variants.find((v) => v.sku === dto.sku) : undefined;
        if (!variant && dto.variantId) {
            variant = product.variants.find((v) => v._id?.toString() === dto.variantId);
        }
        if (!variant && (dto.size || dto.color)) {
            variant = product.variants.find((v) => (dto.size ? v.size === dto.size : true) && (dto.color ? v.color === dto.color : true));
        }
        if (!variant && product.variants?.length > 0) {
            variant = product.variants[0];
        }
        if (!variant) {
            throw new common_1.NotFoundException(`Variant not found for product '${dto.productId}'`);
        }
        const targetSku = variant.sku || dto.sku || `SKU-${variant._id}`;
        const inventory = await this.inventoryRepository.findBySku(targetSku);
        const availableStock = inventory ? inventory.availableStock : variant.stock;
        if (availableStock < dto.quantity) {
            throw new common_1.BadRequestException(`Insufficient stock for SKU '${targetSku}'. Requested: ${dto.quantity}, Available: ${availableStock}`);
        }
        const cart = await this.cartRepository.findOrCreateCart(userId, guestId);
        const existingIndex = cart.items.findIndex((item) => item.sku === targetSku && !item.isSavedForLater);
        if (existingIndex > -1) {
            const newQty = cart.items[existingIndex].quantity + dto.quantity;
            if (availableStock < newQty) {
                throw new common_1.BadRequestException(`Cannot add item. Maximum available stock for SKU '${targetSku}' is ${availableStock}`);
            }
            cart.items[existingIndex].quantity = newQty;
        }
        else {
            const image = variant.images?.[0] || product.images?.[0] || '';
            cart.items.push({
                productId: product._id,
                variantId: variant._id,
                sku: targetSku,
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
        return cart.save();
    }
    async updateItemQuantity(sku, dto, userId) {
        const guestId = dto.guestId;
        const cart = await this.cartRepository.findCart(userId, guestId);
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        const itemIndex = cart.items.findIndex((item) => item.sku === sku);
        if (itemIndex === -1) {
            throw new common_1.NotFoundException(`Item with SKU '${sku}' not found in cart`);
        }
        if (dto.quantity === 0) {
            cart.items.splice(itemIndex, 1);
        }
        else {
            const inventory = await this.inventoryRepository.findBySku(sku);
            if (inventory && inventory.availableStock < dto.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for SKU '${sku}'. Requested: ${dto.quantity}, Available: ${inventory.availableStock}`);
            }
            cart.items[itemIndex].quantity = dto.quantity;
        }
        this.recalculateCart(cart);
        return cart.save();
    }
    async removeItem(sku, userId, guestId) {
        const cart = await this.cartRepository.findCart(userId, guestId);
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        cart.items = cart.items.filter((item) => item.sku !== sku);
        this.recalculateCart(cart);
        return cart.save();
    }
    async mergeGuestCart(dto, userId) {
        const guestCart = await this.cartRepository.findByGuestId(dto.guestId);
        if (!guestCart || !guestCart.items.length) {
            return this.getCart(userId);
        }
        const userCart = await this.cartRepository.findOrCreateCart(userId);
        for (const guestItem of guestCart.items) {
            const userItemIndex = userCart.items.findIndex((item) => item.sku === guestItem.sku);
            if (userItemIndex > -1) {
                userCart.items[userItemIndex].quantity += guestItem.quantity;
            }
            else {
                userCart.items.push(guestItem);
            }
        }
        this.recalculateCart(userCart);
        await userCart.save();
        await this.cartRepository.delete(guestCart._id.toString());
        return userCart;
    }
    async toggleSaveForLater(sku, userId, guestId) {
        const cart = await this.cartRepository.findCart(userId, guestId);
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        const item = cart.items.find((i) => i.sku === sku);
        if (!item) {
            throw new common_1.NotFoundException(`Item with SKU '${sku}' not found in cart`);
        }
        item.isSavedForLater = !item.isSavedForLater;
        this.recalculateCart(cart);
        return cart.save();
    }
    async moveToWishlist(sku, userId) {
        const cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        const itemIndex = cart.items.findIndex((i) => i.sku === sku);
        if (itemIndex === -1) {
            throw new common_1.NotFoundException(`Item with SKU '${sku}' not found in cart`);
        }
        const [item] = cart.items.splice(itemIndex, 1);
        await this.usersRepository.addToWishlist(userId, item.productId.toString());
        this.recalculateCart(cart);
        return cart.save();
    }
    async applyCoupon(dto, userId) {
        const cart = await this.cartRepository.findCart(userId, dto.guestId);
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        if (!cart.items.length) {
            throw new common_1.BadRequestException('Cannot apply coupon to an empty cart');
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
        }
        else {
            cart.couponCode = dto.couponCode.toUpperCase().trim();
        }
        this.recalculateCart(cart);
        return cart.save();
    }
    async removeCoupon(userId, guestId) {
        const cart = await this.cartRepository.findCart(userId, guestId);
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        cart.couponCode = undefined;
        cart.couponDiscount = 0;
        this.recalculateCart(cart);
        return cart.save();
    }
    async clearCart(userId, guestId) {
        const cart = await this.cartRepository.findCart(userId, guestId);
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        cart.items = [];
        cart.couponCode = undefined;
        cart.couponDiscount = 0;
        this.recalculateCart(cart);
        return cart.save();
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cart_repository_js_1.CartRepository,
        products_repository_js_1.ProductsRepository,
        inventory_repository_js_1.InventoryRepository,
        users_repository_js_1.UsersRepository,
        coupons_service_js_1.CouponsService])
], CartService);
//# sourceMappingURL=cart.service.js.map