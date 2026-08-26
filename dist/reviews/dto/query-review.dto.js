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
exports.QueryReviewDto = exports.ReviewSortBy = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const review_schema_js_1 = require("../schemas/review.schema.js");
var ReviewSortBy;
(function (ReviewSortBy) {
    ReviewSortBy["RECENT"] = "recent";
    ReviewSortBy["HELPFUL"] = "helpful";
    ReviewSortBy["RATING_HIGH"] = "rating_high";
    ReviewSortBy["RATING_LOW"] = "rating_low";
})(ReviewSortBy || (exports.ReviewSortBy = ReviewSortBy = {}));
class QueryReviewDto {
    page;
    limit;
    rating;
    sortBy;
    status;
}
exports.QueryReviewDto = QueryReviewDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryReviewDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryReviewDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5, description: 'Filter reviews by rating score (1 to 5)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], QueryReviewDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ReviewSortBy, example: ReviewSortBy.HELPFUL, description: 'Sort by: recent, helpful, rating_high, rating_low' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ReviewSortBy),
    __metadata("design:type", String)
], QueryReviewDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: review_schema_js_1.ReviewStatus, example: review_schema_js_1.ReviewStatus.APPROVED, description: 'Admin filter for review status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(review_schema_js_1.ReviewStatus),
    __metadata("design:type", String)
], QueryReviewDto.prototype, "status", void 0);
//# sourceMappingURL=query-review.dto.js.map