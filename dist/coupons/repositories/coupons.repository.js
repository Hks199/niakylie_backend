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
exports.CouponsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const coupon_schema_js_1 = require("../schemas/coupon.schema.js");
let CouponsRepository = class CouponsRepository {
    couponModel;
    constructor(couponModel) {
        this.couponModel = couponModel;
    }
    async create(createDto) {
        const coupon = new this.couponModel({
            ...createDto,
            code: createDto.code.toUpperCase().trim(),
            startDate: new Date(createDto.startDate),
            endDate: new Date(createDto.endDate),
        });
        return coupon.save();
    }
    async findById(id) {
        return this.couponModel.findOne({ _id: id, isDeleted: false }).exec();
    }
    async findByCode(code) {
        return this.couponModel
            .findOne({ code: code.toUpperCase().trim(), isDeleted: false })
            .exec();
    }
    async findActiveCoupons() {
        const now = new Date();
        return this.couponModel
            .find({
            isActive: true,
            isDeleted: false,
            startDate: { $lte: now },
            endDate: { $gte: now },
        })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, isActive } = queryDto;
        const filter = { isDeleted: false };
        if (isActive !== undefined) {
            filter.isActive = isActive;
        }
        if (search) {
            filter.$or = [
                { code: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.couponModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.couponModel.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async update(id, updateDto) {
        const updateData = { ...updateDto };
        if (updateDto.code) {
            updateData.code = updateDto.code.toUpperCase().trim();
        }
        if (updateDto.startDate) {
            updateData.startDate = new Date(updateDto.startDate);
        }
        if (updateDto.endDate) {
            updateData.endDate = new Date(updateDto.endDate);
        }
        return this.couponModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
            .exec();
    }
    async incrementUsedCount(id) {
        return this.couponModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, { $inc: { usedCount: 1 } }, { new: true })
            .exec();
    }
    async softDelete(id) {
        return this.couponModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), isActive: false }, { new: true })
            .exec();
    }
};
exports.CouponsRepository = CouponsRepository;
exports.CouponsRepository = CouponsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(coupon_schema_js_1.Coupon.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CouponsRepository);
//# sourceMappingURL=coupons.repository.js.map