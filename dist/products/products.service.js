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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const products_repository_js_1 = require("./repositories/products.repository.js");
const s3_service_js_1 = require("../s3/s3.service.js");
const cache_service_js_1 = require("../cache/cache.service.js");
const crypto_1 = require("crypto");
const generateSlug = (text) => text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
const generateSku = () => `NIA-${(0, crypto_1.randomBytes)(3).toString('hex').toUpperCase()}`;
const calcDiscount = (mrp, offerPrice) => mrp > 0 ? Math.round(((mrp - offerPrice) / mrp) * 100) : 0;
let ProductsService = class ProductsService {
    productsRepository;
    s3Service;
    cacheService;
    constructor(productsRepository, s3Service, cacheService) {
        this.productsRepository = productsRepository;
        this.s3Service = s3Service;
        this.cacheService = cacheService;
    }
    async create(createDto) {
        const slug = generateSlug(createDto.name);
        const existing = await this.productsRepository.findBySlug(slug);
        if (existing) {
            throw new common_1.BadRequestException(`Product with slug '${slug}' already exists`);
        }
        const variants = (createDto.variants ?? []).map((v) => {
            if (v.offerPrice > v.mrp) {
                throw new common_1.BadRequestException(`Offer price (${v.offerPrice}) cannot exceed MRP (${v.mrp}) for variant ${v.color}/${v.size}`);
            }
            return {
                ...v,
                sku: v.sku || generateSku(),
                stock: v.stock ?? 0,
                isActive: v.isActive ?? true,
                discount: calcDiscount(v.mrp, v.offerPrice),
                images: [],
            };
        });
        return this.productsRepository.create({
            ...createDto,
            slug,
            variants,
            categoryId: new mongoose_1.Types.ObjectId(createDto.categoryId),
            brandId: createDto.brandId ? new mongoose_1.Types.ObjectId(createDto.brandId) : undefined,
            tags: createDto.tags ?? [],
            seoKeywords: createDto.seoKeywords ?? [],
            tax: createDto.tax ?? 0,
            isFeatured: createDto.isFeatured ?? false,
            isTrending: createDto.isTrending ?? false,
            isBestSeller: createDto.isBestSeller ?? false,
        });
    }
    async uploadImages(productId, files, folder) {
        const product = await this.productsRepository.findById(productId);
        if (!product)
            throw new common_1.NotFoundException(`Product ${productId} not found`);
        const urls = await this.s3Service.uploadManyBuffers(files.map((f) => ({ buffer: f.buffer, originalname: f.originalname, mimetype: f.mimetype })), folder);
        const updated = await this.productsRepository.addImages(productId, urls);
        return updated;
    }
    async update(id, updateDto) {
        const product = await this.productsRepository.findById(id);
        if (!product)
            throw new common_1.NotFoundException(`Product ${id} not found`);
        const updateData = { ...updateDto };
        if (updateDto.name && updateDto.name !== product.name) {
            const newSlug = generateSlug(updateDto.name);
            const existing = await this.productsRepository.findBySlug(newSlug);
            if (existing && existing._id.toString() !== id) {
                throw new common_1.BadRequestException(`Product with slug '${newSlug}' already exists`);
            }
            updateData.slug = newSlug;
        }
        if (updateDto.categoryId)
            updateData.categoryId = new mongoose_1.Types.ObjectId(updateDto.categoryId);
        if (updateDto.brandId)
            updateData.brandId = new mongoose_1.Types.ObjectId(updateDto.brandId);
        const updated = await this.productsRepository.update(id, { $set: updateData });
        if (!updated)
            throw new common_1.NotFoundException(`Product ${id} not found`);
        return updated;
    }
    async delete(id) {
        const product = await this.productsRepository.findById(id);
        if (!product)
            throw new common_1.NotFoundException(`Product ${id} not found`);
        await this.productsRepository.softDelete(id);
    }
    async findByIdOrSlug(idOrSlug) {
        let product = null;
        if (mongoose_1.Types.ObjectId.isValid(idOrSlug)) {
            product = await this.productsRepository.findById(idOrSlug);
        }
        if (!product) {
            product = await this.productsRepository.findBySlug(idOrSlug);
        }
        if (!product)
            throw new common_1.NotFoundException(`Product '${idOrSlug}' not found`);
        return product;
    }
    async findAll(queryDto) {
        if (this.cacheService) {
            const cacheKey = `products:list:${JSON.stringify(queryDto)}`;
            const cached = await this.cacheService.get(cacheKey);
            if (cached)
                return cached;
            const result = await this.productsRepository.findAll(queryDto);
            await this.cacheService.set(cacheKey, result, 300000);
            return result;
        }
        return this.productsRepository.findAll(queryDto);
    }
    async addVariant(productId, variantDto) {
        const product = await this.productsRepository.findById(productId);
        if (!product)
            throw new common_1.NotFoundException(`Product ${productId} not found`);
        if (variantDto.offerPrice > variantDto.mrp) {
            throw new common_1.BadRequestException(`Offer price cannot exceed MRP for variant ${variantDto.color}/${variantDto.size}`);
        }
        const variant = {
            ...variantDto,
            sku: variantDto.sku || generateSku(),
            stock: variantDto.stock ?? 0,
            isActive: variantDto.isActive ?? true,
            discount: calcDiscount(variantDto.mrp, variantDto.offerPrice),
            images: [],
        };
        const updated = await this.productsRepository.addVariant(productId, variant);
        return updated;
    }
    async updateVariant(productId, variantId, variantDto) {
        const product = await this.productsRepository.findById(productId);
        if (!product)
            throw new common_1.NotFoundException(`Product ${productId} not found`);
        const variant = product.variants.find((v) => v._id.toString() === variantId);
        if (!variant)
            throw new common_1.NotFoundException(`Variant ${variantId} not found`);
        const mrp = variantDto.mrp ?? variant.mrp;
        const offerPrice = variantDto.offerPrice ?? variant.offerPrice;
        if (offerPrice > mrp) {
            throw new common_1.BadRequestException('Offer price cannot exceed MRP');
        }
        const updateData = {
            ...variantDto,
            discount: calcDiscount(mrp, offerPrice),
        };
        const updated = await this.productsRepository.updateVariant(productId, variantId, updateData);
        if (!updated)
            throw new common_1.NotFoundException(`Variant ${variantId} not found`);
        return updated;
    }
    async deleteVariant(productId, variantId) {
        const product = await this.productsRepository.findById(productId);
        if (!product)
            throw new common_1.NotFoundException(`Product ${productId} not found`);
        const updated = await this.productsRepository.deleteVariant(productId, variantId);
        if (!updated)
            throw new common_1.NotFoundException(`Variant ${variantId} not found`);
        return updated;
    }
    async uploadVariantImages(productId, variantId, files) {
        const product = await this.productsRepository.findById(productId);
        if (!product)
            throw new common_1.NotFoundException(`Product ${productId} not found`);
        const variant = product.variants.find((v) => v._id.toString() === variantId);
        if (!variant)
            throw new common_1.NotFoundException(`Variant ${variantId} not found`);
        const urls = await this.s3Service.uploadManyBuffers(files.map((f) => ({ buffer: f.buffer, originalname: f.originalname, mimetype: f.mimetype })), `products/${productId}/variants`);
        const existingImages = variant.images ?? [];
        const updated = await this.productsRepository.updateVariant(productId, variantId, {
            images: [...existingImages, ...urls],
        });
        return updated;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [products_repository_js_1.ProductsRepository,
        s3_service_js_1.S3Service,
        cache_service_js_1.RedisCacheService])
], ProductsService);
//# sourceMappingURL=products.service.js.map