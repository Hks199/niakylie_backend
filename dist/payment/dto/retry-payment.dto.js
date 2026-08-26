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
exports.RetryPaymentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const payment_transaction_schema_js_1 = require("../schemas/payment-transaction.schema.js");
class RetryPaymentDto {
    orderId;
    provider;
}
exports.RetryPaymentDto = RetryPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NK-ORD-20260807-1234', description: 'Order ID or Order Number to retry payment for' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RetryPaymentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: payment_transaction_schema_js_1.PaymentProvider, example: payment_transaction_schema_js_1.PaymentProvider.RAZORPAY, description: 'Selected payment provider' }),
    (0, class_validator_1.IsEnum)(payment_transaction_schema_js_1.PaymentProvider),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RetryPaymentDto.prototype, "provider", void 0);
//# sourceMappingURL=retry-payment.dto.js.map