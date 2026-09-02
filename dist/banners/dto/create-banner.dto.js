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
exports.CreateBannerDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const banner_schema_js_1 = require("../schemas/banner.schema.js");
class CreateBannerDto {
    title;
    subtitle;
    discountBadge;
    type;
    position;
    linkUrl;
    linkLabel;
    displayOrder;
    isActive;
    startDate;
    endDate;
    metadata;
}
exports.CreateBannerDto = CreateBannerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Festive Diwali Sale', description: 'Banner title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Up to 50% off on all ethnic wear' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "subtitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'DEAL OF THE DAY' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "discountBadge", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: banner_schema_js_1.BannerType, example: banner_schema_js_1.BannerType.FESTIVAL, description: 'Banner type: HOMEPAGE, OFFER, FESTIVAL, POPUP' }),
    (0, class_validator_1.IsEnum)(banner_schema_js_1.BannerType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: banner_schema_js_1.BannerPosition, example: banner_schema_js_1.BannerPosition.TOP }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(banner_schema_js_1.BannerPosition),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '/category/sarees', description: 'CTA link destination' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "linkUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Shop Now', description: 'CTA button label' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "linkLabel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, description: 'Sorting order for display' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBannerDto.prototype, "displayOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBannerDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-01T00:00:00Z', description: 'Schedule start date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-31T23:59:59Z', description: 'Schedule end date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBannerDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { campaign: 'diwali2026' } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateBannerDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-banner.dto.js.map