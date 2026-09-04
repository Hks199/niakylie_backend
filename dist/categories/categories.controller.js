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
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const categories_service_js_1 = require("./categories.service.js");
const s3_service_js_1 = require("../s3/s3.service.js");
const create_category_dto_js_1 = require("./dto/create-category.dto.js");
const update_category_dto_js_1 = require("./dto/update-category.dto.js");
const query_category_dto_js_1 = require("./dto/query-category.dto.js");
const jwt_auth_guard_js_1 = require("../auth/guards/jwt-auth.guard.js");
const index_js_1 = require("../shared/index.js");
const validateCategoryFile = (file) => {
    if (!file)
        return;
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new common_1.BadRequestException(`Invalid file format for ${file.fieldname}. Only JPG, JPEG, PNG, and WEBP allowed.`);
    }
    if (file.size > 5 * 1024 * 1024) {
        throw new common_1.BadRequestException(`File size exceeds limit for ${file.fieldname}. Max 5MB allowed.`);
    }
};
let CategoriesController = class CategoriesController {
    categoriesService;
    s3Service;
    constructor(categoriesService, s3Service) {
        this.categoriesService = categoriesService;
        this.s3Service = s3Service;
    }
    async create(createDto, files) {
        const imageFile = files?.image?.[0];
        const bannerFile = files?.banner?.[0];
        validateCategoryFile(imageFile);
        validateCategoryFile(bannerFile);
        const imagePath = imageFile
            ? await this.s3Service.uploadBuffer(imageFile.buffer, 'categories', imageFile.originalname, imageFile.mimetype)
            : undefined;
        const bannerPath = bannerFile
            ? await this.s3Service.uploadBuffer(bannerFile.buffer, 'categories/banners', bannerFile.originalname, bannerFile.mimetype)
            : undefined;
        return this.categoriesService.create(createDto, imagePath, bannerPath);
    }
    async findAll(queryDto) {
        return this.categoriesService.findAll(queryDto);
    }
    async getCategoryTree() {
        return this.categoriesService.getCategoryTree();
    }
    async findOne(idOrSlug) {
        return this.categoriesService.findOne(idOrSlug);
    }
    async update(id, updateDto, files) {
        const imageFile = files?.image?.[0];
        const bannerFile = files?.banner?.[0];
        validateCategoryFile(imageFile);
        validateCategoryFile(bannerFile);
        const imagePath = imageFile
            ? await this.s3Service.uploadBuffer(imageFile.buffer, 'categories', imageFile.originalname, imageFile.mimetype)
            : undefined;
        const bannerPath = bannerFile
            ? await this.s3Service.uploadBuffer(bannerFile.buffer, 'categories/banners', bannerFile.originalname, bannerFile.mimetype)
            : undefined;
        return this.categoriesService.update(id, updateDto, imagePath, bannerPath);
    }
    async remove(id) {
        await this.categoriesService.softDelete(id);
    }
    async toggleActive(id) {
        return this.categoriesService.toggleActive(id);
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN, 'admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'image', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
    ], { storage: (0, multer_1.memoryStorage)() })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new category with optional thumbnail & banner files (Admin only)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Ethnic Wear' },
                slug: { type: 'string', example: 'ethnic-wear' },
                parentId: { type: 'string', nullable: true, example: '60d5ecb8b392d40015f8a001' },
                description: { type: 'string', example: 'Traditional women wear collection' },
                displayOrder: { type: 'number', example: 0 },
                status: { type: 'boolean', example: true },
                seoTitle: { type: 'string', example: 'Buy Ethnic Wear Online' },
                seoDescription: { type: 'string', example: 'Shop sarees, kurtas and lehengas' },
                seoKeywords: { type: 'array', items: { type: 'string' }, example: ['ethnic', 'sarees'] },
                image: { type: 'string', format: 'binary' },
                banner: { type: 'string', format: 'binary' },
            },
            required: ['name'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Category created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request - Validation error or duplicate category' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_js_1.CreateCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Header)('Cache-Control', 'no-cache, no-store, must-revalidate'),
    (0, common_1.Header)('Pragma', 'no-cache'),
    (0, common_1.Header)('Expires', '0'),
    (0, swagger_1.ApiOperation)({ summary: 'List categories with pagination, parent filtering, regex search and sorting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of active categories returned with metadata' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_category_dto_js_1.QueryCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    (0, common_1.Header)('Cache-Control', 'no-cache, no-store, must-revalidate'),
    (0, common_1.Header)('Pragma', 'no-cache'),
    (0, common_1.Header)('Expires', '0'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch full 2-level category hierarchy tree array' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category tree hierarchy returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getCategoryTree", null);
__decorate([
    (0, common_1.Get)(':idOrSlug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active category details by Mongo ObjectId or Slug' }),
    (0, swagger_1.ApiParam)({ name: 'idOrSlug', description: '24-character Mongo ObjectId or string slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category details returned' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('idOrSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN, 'admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'image', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
    ], { storage: (0, multer_1.memoryStorage)() })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Update category details and re-calculate ancestor tree if parentId changes (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Category Mongo ObjectId' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                slug: { type: 'string' },
                parentId: { type: 'string', nullable: true },
                description: { type: 'string' },
                displayOrder: { type: 'number' },
                seoTitle: { type: 'string' },
                seoDescription: { type: 'string' },
                seoKeywords: { type: 'array', items: { type: 'string' } },
                status: { type: 'boolean' },
                image: { type: 'string', format: 'binary' },
                banner: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_dto_js_1.UpdateCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN, 'admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete category and recursively soft delete all child sub-categories (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Category Mongo ObjectId' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Category and all descendants soft-deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-active'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard, index_js_1.RolesGuard),
    (0, index_js_1.Roles)(index_js_1.Role.ADMIN, 'admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle category active status flag (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Category Mongo ObjectId' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category active status toggled' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "toggleActive", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, swagger_1.ApiTags)('Categories'),
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [categories_service_js_1.CategoriesService,
        s3_service_js_1.S3Service])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map