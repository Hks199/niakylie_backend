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
exports.OnlinePaymentDiscountSchema = exports.OnlinePaymentDiscount = exports.DiscountType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "PERCENTAGE";
    DiscountType["FLAT"] = "FLAT";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
let OnlinePaymentDiscount = class OnlinePaymentDiscount {
    isEnabled;
    discountType;
    discountValue;
    minOrderAmount;
    maxDiscountCap;
    badgeText;
    description;
};
exports.OnlinePaymentDiscount = OnlinePaymentDiscount;
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], OnlinePaymentDiscount.prototype, "isEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: DiscountType, default: DiscountType.PERCENTAGE }),
    __metadata("design:type", String)
], OnlinePaymentDiscount.prototype, "discountType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 5 }),
    __metadata("design:type", Number)
], OnlinePaymentDiscount.prototype, "discountValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], OnlinePaymentDiscount.prototype, "minOrderAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 500 }),
    __metadata("design:type", Number)
], OnlinePaymentDiscount.prototype, "maxDiscountCap", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'EXTRA 5% OFF ON ONLINE PAYMENTS' }),
    __metadata("design:type", String)
], OnlinePaymentDiscount.prototype, "badgeText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Pay via UPI or Cards to get extra instant discount' }),
    __metadata("design:type", String)
], OnlinePaymentDiscount.prototype, "description", void 0);
exports.OnlinePaymentDiscount = OnlinePaymentDiscount = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], OnlinePaymentDiscount);
exports.OnlinePaymentDiscountSchema = mongoose_1.SchemaFactory.createForClass(OnlinePaymentDiscount);
//# sourceMappingURL=online-payment-discount.schema.js.map