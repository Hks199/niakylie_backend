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
exports.ProcessReturnRefundDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const request_return_dto_js_1 = require("./request-return.dto.js");
class ProcessReturnRefundDto {
    notes;
    refundMethod;
    refundDetails;
}
exports.ProcessReturnRefundDto = ProcessReturnRefundDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Refund processed to customer UPI', description: 'Admin notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessReturnRefundDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ['UPI', 'BANK', 'RAZORPAY'],
        description: 'Override refund method (defaults from return request / payment method)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['UPI', 'BANK', 'RAZORPAY']),
    __metadata("design:type", String)
], ProcessReturnRefundDto.prototype, "refundMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: request_return_dto_js_1.CodRefundDetailsDto,
        description: 'Optional updated COD refund destination details',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => request_return_dto_js_1.CodRefundDetailsDto),
    __metadata("design:type", request_return_dto_js_1.CodRefundDetailsDto)
], ProcessReturnRefundDto.prototype, "refundDetails", void 0);
//# sourceMappingURL=process-return-refund.dto.js.map