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
exports.CartRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cart_schema_js_1 = require("../schemas/cart.schema.js");
let CartRepository = class CartRepository {
    cartModel;
    constructor(cartModel) {
        this.cartModel = cartModel;
    }
    async create(data) {
        const cart = new this.cartModel(data);
        return cart.save();
    }
    async findByUserId(userId) {
        if (!userId)
            return null;
        const query = mongoose_2.Types.ObjectId.isValid(userId)
            ? { $or: [{ userId: new mongoose_2.Types.ObjectId(userId) }, { userId: userId }] }
            : { userId: userId };
        return this.cartModel
            .findOne(query)
            .populate('items.productId', 'name slug images status isDeleted')
            .exec();
    }
    async findByGuestId(guestId) {
        return this.cartModel
            .findOne({ guestId })
            .populate('items.productId', 'name slug images status isDeleted')
            .exec();
    }
    async findCart(userId, guestId) {
        if (userId) {
            const userCart = await this.findByUserId(userId);
            if (userCart)
                return userCart;
        }
        if (guestId) {
            return this.findByGuestId(guestId);
        }
        return null;
    }
    async findOrCreateCart(userId, guestId) {
        let cart = await this.findCart(userId, guestId);
        if (cart) {
            if (userId && !cart.userId) {
                cart.userId = mongoose_2.Types.ObjectId.isValid(userId) ? new mongoose_2.Types.ObjectId(userId) : userId;
                await cart.save();
            }
            return cart;
        }
        const initData = { items: [] };
        if (userId) {
            initData.userId = mongoose_2.Types.ObjectId.isValid(userId) ? new mongoose_2.Types.ObjectId(userId) : userId;
            if (guestId)
                initData.guestId = guestId;
        }
        else if (guestId) {
            initData.guestId = guestId;
        }
        return this.create(initData);
    }
    async update(id, updateData) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.cartModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('items.productId', 'name slug images status isDeleted')
            .exec();
    }
    async delete(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return;
        await this.cartModel.findByIdAndDelete(id).exec();
    }
    async clearCart(userId, guestId) {
        const cart = await this.findCart(userId, guestId);
        if (!cart)
            return null;
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
};
exports.CartRepository = CartRepository;
exports.CartRepository = CartRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(cart_schema_js_1.Cart.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CartRepository);
//# sourceMappingURL=cart.repository.js.map