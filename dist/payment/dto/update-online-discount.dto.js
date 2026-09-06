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
exports.UpdateOnlineDiscountDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const online_payment_discount_schema_js_1 = require("../schemas/online-payment-discount.schema.js");
class UpdateOnlineDiscountDto {
    isEnabled;
    discountType;
    discountValue;
    minOrderAmount;
    maxDiscountCap;
    badgeText;
    description;
}
exports.UpdateOnlineDiscountDto = UpdateOnlineDiscountDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateOnlineDiscountDto.prototype, "isEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: online_payment_discount_schema_js_1.DiscountType, example: online_payment_discount_schema_js_1.DiscountType.PERCENTAGE }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(online_payment_discount_schema_js_1.DiscountType),
    __metadata("design:type", String)
], UpdateOnlineDiscountDto.prototype, "discountType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateOnlineDiscountDto.prototype, "discountValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateOnlineDiscountDto.prototype, "minOrderAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateOnlineDiscountDto.prototype, "maxDiscountCap", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'EXTRA 5% OFF ON ONLINE PAYMENTS' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOnlineDiscountDto.prototype, "badgeText", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Pay via UPI or Cards to get extra instant discount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOnlineDiscountDto.prototype, "description", void 0);
//# sourceMappingURL=update-online-discount.dto.js.map