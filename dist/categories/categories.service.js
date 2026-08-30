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
        const { name, slug: providedSlug, parentId, description, displayOrder, status, seoTitle, seoDescription, seoKeywords } = createDto;
        const slug = generateSlug(providedSlug || name);
        const existing = await this.categoriesRepository.findBySlug(slug);
        if (existing) {
            throw new common_1.BadRequestException('Category slug already exists');
        }
        let ancestors = [];
        let parentObjectId = null;
        if (parentId && parentId !== 'null' && String(parentId).trim() !== '') {
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
        const created = await this.categoriesRepository.create({
            name,
            slug,
            parentId: parentObjectId,
            ancestors,
            description: description || '',
            displayOrder: displayOrder ?? 0,
            status: status !== undefined ? status : true,
            image: imagePath || '',
            banner: bannerPath || '',
            seoTitle: seoTitle || '',
            seoDescription: seoDescription || '',
            seoKeywords: seoKeywords || [],
        });
        if (this.cacheService) {
            await this.cacheService.reset();
        }
        return created;
    }
    async getCategoryTree() {
        const roots = await this.categoriesRepository.findRootCategories();
        const allSubs = await this.categoriesRepository.findAllSubCategories();
        const tree = roots.map((root) => {
            const rootIdStr = root._id.toString();
            const children = allSubs.filter((sub) => {
                const pId = typeof sub.parentId === 'object' && sub.parentId ? (sub.parentId._id || sub.parentId.id) : sub.parentId;
                return String(pId) === rootIdStr;
            });
            return {
                ...root.toObject(),
                subCategories: children,
            };
        });
        return tree;
    }
    async findOne(idOrSlug) {
        const category = await this.categoriesRepository.findByIdOrSlug(idOrSlug);
        if (!category) {
            throw new common_1.NotFoundException(`Category with identifier '${idOrSlug}' not found`);
        }
        return category;
    }
    async findByIdOrSlug(idOrSlug) {
        return this.findOne(idOrSlug);
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
    async findAll(queryDto) {
        const page = queryDto.page || 1;
        const limit = queryDto.limit || 500;
        const { data, total } = await this.categoriesRepository.findAll(queryDto);
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        };
    }
    async update(id, updateDto, imagePath, bannerPath) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        const { name, slug: providedSlug, parentId, description, displayOrder, seoTitle, seoDescription, seoKeywords, status } = updateDto;
        const updateData = {};
        if (description !== undefined)
            updateData.description = description;
        if (displayOrder !== undefined)
            updateData.displayOrder = displayOrder;
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
        if ((name && name !== category.name) || (providedSlug && providedSlug !== category.slug)) {
            const newSlug = generateSlug(providedSlug || name || category.name);
            const existing = await this.categoriesRepository.findBySlug(newSlug);
            if (existing && existing._id.toString() !== id) {
                throw new common_1.BadRequestException('Category slug already exists');
            }
            if (name)
                updateData.name = name;
            updateData.slug = newSlug;
            nameChanged = true;
        }
        if (parentId !== undefined && String(parentId) !== String(category.parentId)) {
            parentChanged = true;
            if (parentId === null || parentId === 'null' || String(parentId).trim() === '') {
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
        if (this.cacheService) {
            await this.cacheService.reset();
        }
        return updatedCategory;
    }
    async softDelete(id) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        await this.categoriesRepository.softDelete(id);
        await this.categoriesRepository.softDeleteDescendants(id);
        if (this.cacheService) {
            await this.cacheService.reset();
        }
    }
    async delete(id) {
        return this.softDelete(id);
    }
    async toggleActive(id) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        const updated = await this.categoriesRepository.update(id, {
            $set: { status: !category.status },
        });
        if (!updated) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        if (this.cacheService) {
            await this.cacheService.reset();
        }
        return updated;
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