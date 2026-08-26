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
exports.CheckoutSummaryDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const order_schema_js_1 = require("../schemas/order.schema.js");
const address_dto_js_1 = require("./address.dto.js");
class CheckoutSummaryDto {
    shippingAddress;
    shippingMethod;
    couponCode;
    guestId;
}
exports.CheckoutSummaryDto = CheckoutSummaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Shipping address details' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => address_dto_js_1.AddressDto),
    __metadata("design:type", address_dto_js_1.AddressDto)
], CheckoutSummaryDto.prototype, "shippingAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: order_schema_js_1.ShippingMethod, example: order_schema_js_1.ShippingMethod.STANDARD, description: 'Shipping method' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(order_schema_js_1.ShippingMethod),
    __metadata("design:type", String)
], CheckoutSummaryDto.prototype, "shippingMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'WELCOME10', description: 'Promo coupon code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckoutSummaryDto.prototype, "couponCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'guest123', description: 'Guest ID if unauthenticated' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckoutSummaryDto.prototype, "guestId", void 0);
//# sourceMappingURL=checkout-summary.dto.js.map