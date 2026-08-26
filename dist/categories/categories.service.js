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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const categories_repository_js_1 = require("./repositories/categories.repository.js");
const cache_service_js_1 = require("../cache/cache.service.js");
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};
let CategoriesService = class CategoriesService {
    categoriesRepository;
    cacheService;
    constructor(categoriesRepository, cacheService) {
        this.categoriesRepository = categoriesRepository;
        this.cacheService = cacheService;
    }
    async create(createDto, imagePath, bannerPath) {
        const { name, parentId, description, seoTitle, seoDescription, seoKeywords } = createDto;
        const slug = generateSlug(name);
        const existing = await this.categoriesRepository.findBySlug(slug);
        if (existing) {
            throw new common_1.BadRequestException(`Category with slug '${slug}' already exists`);
        }
        let ancestors = [];
        let parentObjectId = null;
        if (parentId) {
            const parent = await this.categoriesRepository.findById(parentId);
            if (!parent) {
                throw new common_1.NotFoundException(`Parent category with ID ${parentId} not found`);
            }
            parentObjectId = parent._id;
            ancestors = [
                ...parent.ancestors,
                { _id: parent._id, name: parent.name, slug: parent.slug },
            ];
        }
        return this.categoriesRepository.create({
            name,
            slug,
            parentId: parentObjectId,
            ancestors,
            description,
            image: imagePath,
            banner: bannerPath,
            seoTitle,
            seoDescription,
            seoKeywords: seoKeywords || [],
        });
    }
    async update(id, updateDto, imagePath, bannerPath) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        const { name, parentId, description, seoTitle, seoDescription, seoKeywords, status } = updateDto;
        const updateData = {};
        if (description !== undefined)
            updateData.description = description;
        if (seoTitle !== undefined)
            updateData.seoTitle = seoTitle;
        if (seoDescription !== undefined)
            updateData.seoDescription = seoDescription;
        if (seoKeywords !== undefined)
            updateData.seoKeywords = seoKeywords;
        if (status !== undefined)
            updateData.status = status;
        if (imagePath)
            updateData.image = imagePath;
        if (bannerPath)
            updateData.banner = bannerPath;
        let nameChanged = false;
        let parentChanged = false;
        if (name && name !== category.name) {
            const newSlug = generateSlug(name);
            const existing = await this.categoriesRepository.findBySlug(newSlug);
            if (existing && existing._id.toString() !== id) {
                throw new common_1.BadRequestException(`Category with slug '${newSlug}' already exists`);
            }
            updateData.name = name;
            updateData.slug = newSlug;
            nameChanged = true;
        }
        if (parentId !== undefined && String(parentId) !== String(category.parentId)) {
            parentChanged = true;
            if (parentId === null) {
                updateData.parentId = null;
                updateData.ancestors = [];
            }
            else {
                if (parentId === id) {
                    throw new common_1.BadRequestException('A category cannot be its own parent');
                }
                const targetParent = await this.categoriesRepository.findById(parentId);
                if (!targetParent) {
                    throw new common_1.NotFoundException(`Parent category with ID ${parentId} not found`);
                }
                const isDescendant = targetParent.ancestors.some((anc) => anc._id.toString() === id);
                if (isDescendant) {
                    throw new common_1.BadRequestException('Cycle detected: Parent category cannot be a descendant of the target category');
                }
                updateData.parentId = new mongoose_1.Types.ObjectId(parentId);
                updateData.ancestors = [
                    ...targetParent.ancestors,
                    { _id: targetParent._id, name: targetParent.name, slug: targetParent.slug },
                ];
            }
        }
        const updatedCategory = await this.categoriesRepository.update(id, { $set: updateData });
        if (!updatedCategory) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        if (nameChanged || parentChanged) {
            await this.updateDescendantsAncestors(id, updatedCategory.ancestors, updatedCategory.name, updatedCategory.slug);
        }
        return updatedCategory;
    }
    async delete(id) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        await this.categoriesRepository.softDelete(id);
        await this.categoriesRepository.softDeleteDescendants(id);
    }
    async findById(id) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async findBySlug(slug) {
        const category = await this.categoriesRepository.findBySlug(slug);
        if (!category) {
            throw new common_1.NotFoundException(`Category with slug '${slug}' not found`);
        }
        return category;
    }
    async findByIdOrSlug(idOrSlug) {
        let category = null;
        if (mongoose_1.Types.ObjectId.isValid(idOrSlug)) {
            category = await this.categoriesRepository.findById(idOrSlug);
        }
        if (!category) {
            category = await this.categoriesRepository.findBySlug(idOrSlug);
        }
        if (!category) {
            throw new common_1.NotFoundException(`Category with identifier '${idOrSlug}' not found`);
        }
        return category;
    }
    async findAll(queryDto) {
        if (this.cacheService) {
            const cacheKey = `categories:list:${JSON.stringify(queryDto)}`;
            const cached = await this.cacheService.get(cacheKey);
            if (cached)
                return cached;
            const result = await this.categoriesRepository.findAll(queryDto);
            await this.cacheService.set(cacheKey, result, 600000);
            return result;
        }
        return this.categoriesRepository.findAll(queryDto);
    }
    async updateDescendantsAncestors(parentId, parentAncestors, parentName, parentSlug) {
        const children = await this.categoriesRepository.findDirectChildren(parentId);
        const parentNode = { _id: new mongoose_1.Types.ObjectId(parentId), name: parentName, slug: parentSlug };
        const childAncestors = [...parentAncestors, parentNode];
        for (const child of children) {
            await this.categoriesRepository.update(child._id.toString(), {
                $set: { ancestors: childAncestors },
            });
            await this.updateDescendantsAncestors(child._id.toString(), childAncestors, child.name, child.slug);
        }
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [categories_repository_js_1.CategoriesRepository,
        cache_service_js_1.RedisCacheService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map