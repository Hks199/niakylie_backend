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
exports.PlaceOrderDto = exports.CustomerInfoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const order_schema_js_1 = require("../schemas/order.schema.js");
const address_dto_js_1 = require("./address.dto.js");
class CustomerInfoDto {
    email;
    firstName;
    lastName;
    phone;
}
exports.CustomerInfoDto = CustomerInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'customer@example.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CustomerInfoDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jane' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CustomerInfoDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CustomerInfoDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+919876543210' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CustomerInfoDto.prototype, "phone", void 0);
class PlaceOrderDto {
    shippingAddress;
    billingAddress;
    customerInfo;
    paymentMethod;
    shippingMethod;
    couponCode;
    guestId;
}
exports.PlaceOrderDto = PlaceOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Shipping address details' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => address_dto_js_1.AddressDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", address_dto_js_1.AddressDto)
], PlaceOrderDto.prototype, "shippingAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Billing address details (defaults to shipping address if omitted)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => address_dto_js_1.AddressDto),
    __metadata("design:type", address_dto_js_1.AddressDto)
], PlaceOrderDto.prototype, "billingAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer details (required for guest checkout)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CustomerInfoDto),
    __metadata("design:type", CustomerInfoDto)
], PlaceOrderDto.prototype, "customerInfo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: order_schema_js_1.PaymentMethod, example: order_schema_js_1.PaymentMethod.COD, description: 'Selected payment method' }),
    (0, class_validator_1.IsEnum)(order_schema_js_1.PaymentMethod),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PlaceOrderDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: order_schema_js_1.ShippingMethod, example: order_schema_js_1.ShippingMethod.STANDARD, description: 'Selected shipping method' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(order_schema_js_1.ShippingMethod),
    __metadata("design:type", String)
], PlaceOrderDto.prototype, "shippingMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'WELCOME10', description: 'Promo coupon code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlaceOrderDto.prototype, "couponCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'guest123', description: 'Guest ID if unauthenticated' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlaceOrderDto.prototype, "guestId", void 0);
//# sourceMappingURL=place-order.dto.js.map