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
exports.ModerateReviewDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const review_schema_js_1 = require("../schemas/review.schema.js");
class ModerateReviewDto {
    status;
    adminResponse;
}
exports.ModerateReviewDto = ModerateReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: review_schema_js_1.ReviewStatus, example: review_schema_js_1.ReviewStatus.APPROVED, description: 'Moderation action: APPROVED or REJECTED' }),
    (0, class_validator_1.IsEnum)(review_schema_js_1.ReviewStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ModerateReviewDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Thank you for your feedback!', description: 'Optional admin/seller response' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ModerateReviewDto.prototype, "adminResponse", void 0);
//# sourceMappingURL=moderate-review.dto.js.map