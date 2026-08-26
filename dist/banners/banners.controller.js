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
exports.BannersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const banners_service_js_1 = require("./banners.service.js");
const create_banner_dto_js_1 = require("./dto/create-banner.dto.js");
const update_banner_dto_js_1 = require("./dto/update-banner.dto.js");
const query_banner_dto_js_1 = require("./dto/query-banner.dto.js");
let BannersController = class BannersController {
    bannersService;
    constructor(bannersService) {
        this.bannersService = bannersService;
    }
    async getActiveBanners(query) {
        return this.bannersService.getActiveBanners(query);
    }
    async getBannerById(id) {
        return this.bannersService.getBannerById(id);
    }
    async getAllBanners(query) {
        return this.bannersService.getAllBanners(query);
    }
    async createBanner(dto, files) {
        return this.bannersService.createBanner(dto, files);
    }
    async updateBanner(id, dto, files) {
        return this.bannersService.updateBanner(id, dto, files);
    }
    async toggleActive(id) {
        return this.bannersService.toggleActive(id);
    }
    async reorder(body) {
        return this.bannersService.reorder(body);
    }
    async deleteBanner(id) {
        return this.bannersService.deleteBanner(id);
    }
};
exports.BannersController = BannersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get active banners (respects scheduling window). Filter by type: HOMEPAGE, OFFER, FESTIVAL, POPUP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active banners returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_banner_dto_js_1.QueryBannerDto]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "getActiveBanners", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get banner by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Banner details returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Banner not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "getBannerById", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Get all banners including inactive ones' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All banners returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_banner_dto_js_1.QueryBannerDto]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "getAllBanners", null);
__decorate([
    (0, common_1.Post)('admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Create a new banner and upload image to S3' }),
    (0, swagger_1.ApiBody)({
        description: 'Multipart form: banner metadata + image file (required) + optional mobile image',
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Diwali Festive Sale' },
                type: { type: 'string', enum: ['HOMEPAGE', 'OFFER', 'FESTIVAL', 'POPUP'] },
                position: { type: 'string', enum: ['TOP', 'MIDDLE', 'BOTTOM', 'SIDEBAR'] },
                linkUrl: { type: 'string' },
                linkLabel: { type: 'string' },
                displayOrder: { type: 'number' },
                isActive: { type: 'boolean' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                image: { type: 'string', format: 'binary', description: 'Desktop banner image' },
                mobileImage: { type: 'string', format: 'binary', description: 'Optional mobile banner image' },
            },
            required: ['title', 'type', 'image'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Banner created and image uploaded to S3' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'image', maxCount: 1 },
        { name: 'mobileImage', maxCount: 1 },
    ], { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_banner_dto_js_1.CreateBannerDto, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "createBanner", null);
__decorate([
    (0, common_1.Put)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Update banner metadata and/or replace image on S3' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Banner updated' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'image', maxCount: 1 },
        { name: 'mobileImage', maxCount: 1 },
    ], { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_banner_dto_js_1.UpdateBannerDto, Object]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "updateBanner", null);
__decorate([
    (0, common_1.Patch)('admin/:id/toggle-active'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Toggle banner active/inactive status' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Banner status toggled' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Patch)('admin/reorder'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Batch reorder banners by setting displayOrder values' }),
    (0, swagger_1.ApiBody)({
        description: 'Array of banner IDs with their new display order values',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: '60d5ecb8b392d40015f8a001' },
                    displayOrder: { type: 'number', example: 1 },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Banners reordered' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "reorder", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Delete banner and remove images from S3' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '60d5ecb8b392d40015f8a001' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Banner deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BannersController.prototype, "deleteBanner", null);
exports.BannersController = BannersController = __decorate([
    (0, swagger_1.ApiTags)('Banners'),
    (0, common_1.Controller)('banners'),
    __metadata("design:paramtypes", [banners_service_js_1.BannersService])
], BannersController);
//# sourceMappingURL=banners.controller.js.map