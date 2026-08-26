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
exports.CreatePaymentIntentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const payment_transaction_schema_js_1 = require("../schemas/payment-transaction.schema.js");
class CreatePaymentIntentDto {
    orderId;
    provider;
    paymentType;
    partialAmount;
    guestId;
}
exports.CreatePaymentIntentDto = CreatePaymentIntentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60d5ecb8b392d40015f8a020', description: 'Order Mongo ID or Order Number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: payment_transaction_schema_js_1.PaymentProvider, example: payment_transaction_schema_js_1.PaymentProvider.RAZORPAY, description: 'Selected payment provider' }),
    (0, class_validator_1.IsEnum)(payment_transaction_schema_js_1.PaymentProvider),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: payment_transaction_schema_js_1.PaymentType, example: payment_transaction_schema_js_1.PaymentType.FULL, description: 'Payment type (FULL or PARTIAL)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(payment_transaction_schema_js_1.PaymentType),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "paymentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 500, description: 'Partial payment amount if paymentType is PARTIAL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePaymentIntentDto.prototype, "partialAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'guest123', description: 'Guest ID if unauthenticated' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "guestId", void 0);
//# sourceMappingURL=create-payment-intent.dto.js.map