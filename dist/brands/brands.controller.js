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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const brands_service_js_1 = require("./brands.service.js");
const create_brand_dto_js_1 = require("./dto/create-brand.dto.js");
const update_brand_dto_js_1 = require("./dto/update-brand.dto.js");
const query_brand_dto_js_1 = require("./dto/query-brand.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const index_js_1 = require("../shared/index.js");
let BrandsController = class BrandsController {
    brandsService;
    constructor(brandsService) {
        this.brandsService = brandsService;
    }
    async create(createDto, logoFile) {
        if (logoFile) {
            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedMimeTypes.includes(logoFile.mimetype)) {
                throw new common_1.BadRequestException('Invalid file format for logo. Only JPG, JPEG, PNG, and WEBP allowed.');
            }
            if (logoFile.size > 5 * 1024 * 1024) {
                throw new common_1.BadRequestException('Logo file size exceeds limit. Max 5MB allowed.');
            }
        }
        const logoPath = logoFile ? `/uploads/brands/${logoFile.filename}` : undefined;
        return this.brandsService.create(createDto, logoPath);
    }
    async findAll(queryDto) {
        return this.brandsService.findAll(queryDto);
    }
    async findOne(idOrSlug) {
        return this.brandsService.findByIdOrSlug(idOrSlug);
    }
    async update(id, updateDto, logoFile) {
        if (logoFile) {
            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedMimeTypes.includes(logoFile.mimetype)) {
                throw new common_1.BadRequestException('Invalid file format for logo. Only JPG, JPEG, PNG, and WEBP allowed.');
            }
            if (logoFile.size > 5 * 1024 * 1024) {
                throw new common_1.BadRequestException('Logo file size exceeds limit. Max 5MB allowed.');
            }
        }
        const logoPath = logoFile ? `/uploads/brands/${logoFile.filename}` : undefined;
        return this.brandsService.update(id, updateDto, logoPath);
    }
    async remove(id) {
        await this.brandsService.delete(id);
    }
};
exports.BrandsController = BrandsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new brand (Admin only)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                seoTitle: { type: 'string' },
                seoDescription: { type: 'string' },
                seoKeywords: { type: 'array', items: { type: 'string' } },
                logo: { type: 'string', format: 'binary' },
            },
            required: ['name'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Brand created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_brand_dto_js_1.CreateBrandDto, Object]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List brands with pagination, search and sorting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated brand details returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_brand_dto_js_1.QueryBrandDto]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':idOrSlug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get brand details by ID or Slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Brand details returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Brand not found' }),
    __param(0, (0, common_1.Param)('idOrSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Update brand details (Admin only)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                seoTitle: { type: 'string' },
                seoDescription: { type: 'string' },
                seoKeywords: { type: 'array', items: { type: 'string' } },
                status: { type: 'boolean' },
                logo: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Brand updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_brand_dto_js_1.UpdateBrandDto, Object]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete brand (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Brand soft-deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandsController.prototype, "remove", null);
exports.BrandsController = BrandsController = __decorate([
    (0, swagger_1.ApiTags)('Brands'),
    (0, common_1.Controller)('brands'),
    __metadata("design:paramtypes", [brands_service_js_1.BrandsService])
], BrandsController);
//# sourceMappingURL=brands.controller.js.map