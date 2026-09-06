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
exports.RequestReturnDto = exports.CodRefundDetailsDto = exports.ReturnItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class ReturnItemDto {
    productId;
    variantId;
    sku;
    quantity;
}
exports.ReturnItemDto = ReturnItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60d5ecb8b392d40015f8a001', description: 'Product ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ReturnItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '60d5ecb8b392d40015f8a002', description: 'Variant ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReturnItemDto.prototype, "variantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'NK-SAR-001-RED-M', description: 'SKU' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReturnItemDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Quantity to return' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ReturnItemDto.prototype, "quantity", void 0);
class CodRefundDetailsDto {
    upiId;
    bankAccountNumber;
    bankIfsc;
    bankAccountName;
}
exports.CodRefundDetailsDto = CodRefundDetailsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ananya@upi', description: 'UPI ID for COD refund' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CodRefundDetailsDto.prototype, "upiId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '123456789012', description: 'Bank account number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CodRefundDetailsDto.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'HDFC0001234', description: 'Bank IFSC code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CodRefundDetailsDto.prototype, "bankIfsc", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Ananya Roy', description: 'Account holder name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CodRefundDetailsDto.prototype, "bankAccountName", void 0);
class RequestReturnDto {
    orderId;
    reason;
    notes;
    items;
    refundMethod;
    refundDetails;
    images;
}
exports.RequestReturnDto = RequestReturnDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NK-ORD-20260807-1234', description: 'Order number to request return for' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestReturnDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Product arrived damaged', description: 'Reason for return request' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestReturnDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'The saree had a torn edge on arrival', description: 'Additional notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestReturnDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [ReturnItemDto],
        description: 'Item-level return selection (at least one item required)',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReturnItemDto),
    __metadata("design:type", Array)
], RequestReturnDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['UPI', 'BANK'],
        description: 'COD refund preference (required when order was paid via COD)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['UPI', 'BANK']),
    __metadata("design:type", String)
], RequestReturnDto.prototype, "refundMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CodRefundDetailsDto, description: 'UPI / bank details for COD refunds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CodRefundDetailsDto),
    __metadata("design:type", CodRefundDetailsDto)
], RequestReturnDto.prototype, "refundDetails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Optional evidence image URLs' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RequestReturnDto.prototype, "images", void 0);
//# sourceMappingURL=request-return.dto.js.map