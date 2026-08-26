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
exports.CouponSchema = exports.Coupon = exports.CouponApplicability = exports.CouponType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var CouponType;
(function (CouponType) {
    CouponType["FLAT"] = "FLAT";
    CouponType["PERCENTAGE"] = "PERCENTAGE";
})(CouponType || (exports.CouponType = CouponType = {}));
var CouponApplicability;
(function (CouponApplicability) {
    CouponApplicability["ALL"] = "ALL";
    CouponApplicability["PRODUCT"] = "PRODUCT";
    CouponApplicability["CATEGORY"] = "CATEGORY";
    CouponApplicability["CUSTOMER"] = "CUSTOMER";
})(CouponApplicability || (exports.CouponApplicability = CouponApplicability = {}));
let Coupon = class Coupon {
    code;
    title;
    description;
    type;
    value;
    applicability;
    applicableProductIds;
    applicableCategoryIds;
    applicableCustomerIds;
    minOrderAmount;
    maxDiscount;
    usageLimit;
    usedCount;
    userLimit;
    startDate;
    endDate;
    isActive;
    isDeleted;
    deletedAt;
};
exports.Coupon = Coupon;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, uppercase: true, trim: true, index: true }),
    __metadata("design:type", String)
], Coupon.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Coupon.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Coupon.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: CouponType }),
    __metadata("design:type", String)
], Coupon.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Coupon.prototype, "value", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: CouponApplicability, default: CouponApplicability.ALL }),
    __metadata("design:type", String)
], Coupon.prototype, "applicability", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Product' }], default: [] }),
    __metadata("design:type", Array)
], Coupon.prototype, "applicableProductIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Category' }], default: [] }),
    __metadata("design:type", Array)
], Coupon.prototype, "applicableCategoryIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }], default: [] }),
    __metadata("design:type", Array)
], Coupon.prototype, "applicableCustomerIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Coupon.prototype, "minOrderAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null, min: 0 }),
    __metadata("design:type", Object)
], Coupon.prototype, "maxDiscount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: null, min: 1 }),
    __metadata("design:type", Object)
], Coupon.prototype, "usageLimit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Coupon.prototype, "usedCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1, min: 1 }),
    __metadata("design:type", Number)
], Coupon.prototype, "userLimit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Coupon.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], Coupon.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], Coupon.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Coupon.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Coupon.prototype, "deletedAt", void 0);
exports.Coupon = Coupon = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Coupon);
exports.CouponSchema = mongoose_1.SchemaFactory.createForClass(Coupon);
exports.CouponSchema.index({ code: 1 });
exports.CouponSchema.index({ isActive: 1, isDeleted: 1, startDate: 1, endDate: 1 });
//# sourceMappingURL=coupon.schema.js.map