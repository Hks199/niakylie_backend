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
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const coupons_repository_js_1 = require("./repositories/coupons.repository.js");
const coupon_schema_js_1 = require("./schemas/coupon.schema.js");
let CouponsService = class CouponsService {
    couponsRepository;
    constructor(couponsRepository) {
        this.couponsRepository = couponsRepository;
    }
    async createCoupon(createDto) {
        const existing = await this.couponsRepository.findByCode(createDto.code);
        if (existing) {
            throw new common_1.ConflictException(`Coupon code '${createDto.code.toUpperCase()}' already exists`);
        }
        if (new Date(createDto.startDate) >= new Date(createDto.endDate)) {
            throw new common_1.BadRequestException('Start date must be before end date');
        }
        return this.couponsRepository.create(createDto);
    }
    async findAll(queryDto) {
        return this.couponsRepository.findAll(queryDto);
    }
    async findActiveCoupons() {
        return this.couponsRepository.findActiveCoupons();
    }
    async findById(id) {
        const coupon = await this.couponsRepository.findById(id);
        if (!coupon) {
            throw new common_1.NotFoundException(`Coupon with ID '${id}' not found`);
        }
        return coupon;
    }
    async findByCode(code) {
        const coupon = await this.couponsRepository.findByCode(code);
        if (!coupon) {
            throw new common_1.NotFoundException(`Coupon with code '${code}' not found`);
        }
        return coupon;
    }
    calculateDiscount(coupon, subtotal, items) {
        let eligibleSubtotal = subtotal;
        if (coupon.applicability === coupon_schema_js_1.CouponApplicability.PRODUCT && items?.length) {
            const productIds = (coupon.applicableProductIds || []).map((id) => id.toString());
            eligibleSubtotal = items
                .filter((item) => productIds.includes(item.productId))
                .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        }
        else if (coupon.applicability === coupon_schema_js_1.CouponApplicability.CATEGORY && items?.length) {
            const categoryIds = (coupon.applicableCategoryIds || []).map((id) => id.toString());
            eligibleSubtotal = items
                .filter((item) => item.categoryId && categoryIds.includes(item.categoryId))
                .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        }
        if (eligibleSubtotal <= 0) {
            return 0;
        }
        let discount = 0;
        if (coupon.type === coupon_schema_js_1.CouponType.FLAT) {
            discount = Math.min(coupon.value, eligibleSubtotal);
        }
        else if (coupon.type === coupon_schema_js_1.CouponType.PERCENTAGE) {
            discount = Math.round(eligibleSubtotal * (coupon.value / 100));
            if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined && coupon.maxDiscount > 0) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        }
        return Math.min(discount, subtotal);
    }
    async validateCoupon(dto) {
        const coupon = await this.couponsRepository.findByCode(dto.code);
        if (!coupon || !coupon.isActive || coupon.isDeleted) {
            throw new common_1.NotFoundException(`Coupon code '${dto.code}' is invalid or inactive`);
        }
        const now = new Date();
        if (now < coupon.startDate) {
            throw new common_1.BadRequestException(`Coupon code '${dto.code}' is not active yet`);
        }
        if (now > coupon.endDate) {
            throw new common_1.BadRequestException(`Coupon code '${dto.code}' has expired`);
        }
        if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
            throw new common_1.BadRequestException(`Coupon code '${dto.code}' usage limit has been reached`);
        }
        if (dto.subtotal < coupon.minOrderAmount) {
            throw new common_1.BadRequestException(`Minimum subtotal requirement of ₹${coupon.minOrderAmount} not met for coupon '${dto.code}'`);
        }
        if (coupon.applicability === coupon_schema_js_1.CouponApplicability.CUSTOMER) {
            const customerIds = (coupon.applicableCustomerIds || []).map((id) => id.toString());
            if (!dto.userId || !customerIds.includes(dto.userId)) {
                throw new common_1.BadRequestException(`Coupon code '${dto.code}' is not valid for this customer`);
            }
        }
        if (coupon.applicability === coupon_schema_js_1.CouponApplicability.PRODUCT) {
            const productIds = (coupon.applicableProductIds || []).map((id) => id.toString());
            const hasProduct = dto.items?.some((item) => productIds.includes(item.productId));
            if (!hasProduct) {
                throw new common_1.BadRequestException(`Coupon '${dto.code}' is not applicable to any items in cart`);
            }
        }
        if (coupon.applicability === coupon_schema_js_1.CouponApplicability.CATEGORY) {
            const categoryIds = (coupon.applicableCategoryIds || []).map((id) => id.toString());
            const hasCategory = dto.items?.some((item) => item.categoryId && categoryIds.includes(item.categoryId));
            if (!hasCategory) {
                throw new common_1.BadRequestException(`Coupon '${dto.code}' is not applicable to any categories in cart`);
            }
        }
        const discountAmount = this.calculateDiscount(coupon, dto.subtotal, dto.items);
        return {
            valid: true,
            code: coupon.code,
            type: coupon.type,
            discountAmount,
            message: 'Coupon applied successfully',
            coupon,
        };
    }
    async updateCoupon(id, updateDto) {
        const existing = await this.findById(id);
        if (updateDto.code && updateDto.code.toUpperCase() !== existing.code) {
            const duplicate = await this.couponsRepository.findByCode(updateDto.code);
            if (duplicate && duplicate._id.toString() !== id) {
                throw new common_1.ConflictException(`Coupon code '${updateDto.code.toUpperCase()}' is already taken`);
            }
        }
        const updated = await this.couponsRepository.update(id, updateDto);
        if (!updated) {
            throw new common_1.NotFoundException(`Coupon with ID '${id}' not found`);
        }
        return updated;
    }
    async toggleStatus(id) {
        const coupon = await this.findById(id);
        const updated = await this.couponsRepository.update(id, { isActive: !coupon.isActive });
        if (!updated) {
            throw new common_1.NotFoundException(`Coupon with ID '${id}' not found`);
        }
        return updated;
    }
    async recordUsage(id) {
        const updated = await this.couponsRepository.incrementUsedCount(id);
        if (!updated) {
            throw new common_1.NotFoundException(`Coupon with ID '${id}' not found`);
        }
        return updated;
    }
    async deleteCoupon(id) {
        const deleted = await this.couponsRepository.softDelete(id);
        if (!deleted) {
            throw new common_1.NotFoundException(`Coupon with ID '${id}' not found`);
        }
        return deleted;
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [coupons_repository_js_1.CouponsRepository])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map