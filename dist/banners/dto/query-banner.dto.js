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
exports.QueryBannerDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const banner_schema_js_1 = require("../schemas/banner.schema.js");
class QueryBannerDto {
    type;
    position;
    isActive;
    _t;
}
exports.QueryBannerDto = QueryBannerDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: banner_schema_js_1.BannerType, example: banner_schema_js_1.BannerType.HOMEPAGE, description: 'Filter by banner type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(banner_schema_js_1.BannerType),
    __metadata("design:type", String)
], QueryBannerDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: banner_schema_js_1.BannerPosition, example: banner_schema_js_1.BannerPosition.TOP, description: 'Filter by banner position' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(banner_schema_js_1.BannerPosition),
    __metadata("design:type", String)
], QueryBannerDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Filter by active status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], QueryBannerDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timestamp cache buster' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryBannerDto.prototype, "_t", void 0);
//# sourceMappingURL=query-banner.dto.js.map