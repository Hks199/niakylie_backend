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
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_js_1 = require("../schemas/user.schema.js");
let UsersRepository = class UsersRepository {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(user) {
        const newUser = new this.userModel(user);
        return newUser.save();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.userModel.findById(id).exec();
    }
    async findAll(options) {
        const page = options?.page || 1;
        const limit = options?.limit || 100;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.userModel.find().skip(skip).limit(limit).exec(),
            this.userModel.countDocuments().exec(),
        ]);
        return { data, total };
    }
    async findByEmail(email, includePassword = false) {
        const query = this.userModel.findOne({ email });
        if (includePassword) {
            query.select('+password +refreshTokens');
        }
        return query.exec();
    }
    async findByGoogleId(googleId) {
        return this.userModel.findOne({ googleId }).exec();
    }
    async findByVerificationToken(token) {
        return this.userModel
            .findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() },
        })
            .select('+emailVerificationToken +emailVerificationExpires')
            .exec();
    }
    async findByResetToken(token) {
        return this.userModel
            .findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() },
        })
            .select('+passwordResetToken +passwordResetExpires')
            .exec();
    }
    async update(id, updateData) {
        return this.userModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
    }
    async addRefreshToken(id, token) {
        await this.userModel
            .findByIdAndUpdate(id, {
            $push: { refreshTokens: token },
        })
            .exec();
    }
    async removeRefreshToken(id, token) {
        await this.userModel
            .findByIdAndUpdate(id, {
            $pull: { refreshTokens: token },
        })
            .exec();
    }
    async clearRefreshTokens(id) {
        await this.userModel
            .findByIdAndUpdate(id, {
            $set: { refreshTokens: [] },
        })
            .exec();
    }
    async addAddress(userId, address) {
        return this.userModel
            .findByIdAndUpdate(userId, { $push: { addresses: address } }, { new: true })
            .exec();
    }
    async resetDefaultAddresses(userId) {
        await this.userModel
            .updateOne({ _id: userId }, { $set: { 'addresses.$[].isDefault': false } })
            .exec();
    }
    async updateAddress(userId, addressId, addressData) {
        const updateFields = {};
        for (const [key, value] of Object.entries(addressData)) {
            updateFields[`addresses.$.${key}`] = value;
        }
        return this.userModel
            .findOneAndUpdate({ _id: userId, 'addresses._id': new mongoose_2.Types.ObjectId(addressId) }, { $set: updateFields }, { new: true })
            .exec();
    }
    async deleteAddress(userId, addressId) {
        return this.userModel
            .findByIdAndUpdate(userId, { $pull: { addresses: { _id: new mongoose_2.Types.ObjectId(addressId) } } }, { new: true })
            .exec();
    }
    async getWishlist(userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId))
            return [];
        const user = await this.userModel
            .findById(userId)
            .populate({
            path: 'wishlist',
            match: { isDeleted: { $ne: true } },
        })
            .exec();
        if (!user || !user.wishlist)
            return [];
        const rawItems = user.wishlist.filter((item) => item && typeof item === 'object' && item._id);
        return rawItems.map((item) => {
            const prod = item.toObject ? item.toObject() : item;
            const firstVariant = prod.variants && prod.variants.length > 0 ? prod.variants[0] : null;
            const offerPrice = prod.offerPrice ?? prod.price ?? firstVariant?.offerPrice ?? 0;
            const mrp = prod.mrp ?? prod.compareAtPrice ?? firstVariant?.mrp ?? offerPrice;
            const discount = firstVariant?.discount ?? (mrp > 0 ? Math.round(((mrp - offerPrice) / mrp) * 100) : 0);
            const thumbnail = prod.thumbnail || firstVariant?.images?.[0] || prod.images?.[0] || '';
            return {
                ...prod,
                id: prod._id ? prod._id.toString() : prod.id,
                title: prod.title || prod.name,
                name: prod.name || prod.title,
                price: offerPrice,
                offerPrice,
                mrp,
                compareAtPrice: mrp,
                originalPrice: mrp,
                discountPercentage: discount,
                discount,
                thumbnail,
            };
        });
    }
    async addToWishlist(userId, productId) {
        if (!mongoose_2.Types.ObjectId.isValid(productId))
            return null;
        return this.userModel
            .findByIdAndUpdate(userId, { $addToSet: { wishlist: new mongoose_2.Types.ObjectId(productId) } }, { new: true })
            .exec();
    }
    async removeFromWishlist(userId, productId) {
        if (!mongoose_2.Types.ObjectId.isValid(productId))
            return null;
        return this.userModel
            .findByIdAndUpdate(userId, { $pull: { wishlist: new mongoose_2.Types.ObjectId(productId) } }, { new: true })
            .exec();
    }
    async addRecentlyViewed(userId, productId) {
        if (!mongoose_2.Types.ObjectId.isValid(productId))
            return null;
        await this.userModel
            .findByIdAndUpdate(userId, {
            $pull: { recentlyViewed: { productId: new mongoose_2.Types.ObjectId(productId) } },
        })
            .exec();
        return this.userModel
            .findByIdAndUpdate(userId, {
            $push: {
                recentlyViewed: {
                    $each: [{ productId: new mongoose_2.Types.ObjectId(productId), viewedAt: new Date() }],
                    $position: 0,
                    $slice: 10,
                },
            },
        }, { new: true })
            .exec();
    }
    async updateWalletBalance(userId, amount, transaction) {
        return this.userModel
            .findByIdAndUpdate(userId, {
            $inc: { 'wallet.balance': amount },
            $push: { 'wallet.history': { ...transaction, createdAt: new Date() } },
        }, { new: true })
            .exec();
    }
    async incrementRewardPoints(userId, points) {
        return this.userModel
            .findByIdAndUpdate(userId, { $inc: { rewardPoints: points } }, { new: true })
            .exec();
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_js_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map