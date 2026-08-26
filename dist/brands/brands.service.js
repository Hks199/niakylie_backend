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
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const brands_repository_js_1 = require("./repositories/brands.repository.js");
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};
let BrandsService = class BrandsService {
    brandsRepository;
    constructor(brandsRepository) {
        this.brandsRepository = brandsRepository;
    }
    async create(createDto, logoPath) {
        const { name, description, seoTitle, seoDescription, seoKeywords } = createDto;
        const slug = generateSlug(name);
        const existing = await this.brandsRepository.findBySlug(slug);
        if (existing) {
            throw new common_1.BadRequestException(`Brand with name '${name}' or slug '${slug}' already exists`);
        }
        return this.brandsRepository.create({
            name,
            slug,
            logo: logoPath,
            description,
            seoTitle,
            seoDescription,
            seoKeywords: seoKeywords || [],
            status: true,
            isDeleted: false,
        });
    }
    async findAll(queryDto) {
        const page = queryDto.page || 1;
        const limit = queryDto.limit || 10;
        const { data, total } = await this.brandsRepository.findAll(queryDto);
        const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
        return {
            data,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async findByIdOrSlug(idOrSlug) {
        const brand = await this.brandsRepository.findByIdOrSlug(idOrSlug);
        if (!brand) {
            throw new common_1.NotFoundException('Brand not found');
        }
        return brand;
    }
    async findById(id) {
        const brand = await this.brandsRepository.findById(id);
        if (!brand) {
            throw new common_1.NotFoundException('Brand not found');
        }
        return brand;
    }
    async findBySlug(slug) {
        const brand = await this.brandsRepository.findBySlug(slug);
        if (!brand) {
            throw new common_1.NotFoundException('Brand not found');
        }
        return brand;
    }
    async update(id, updateDto, logoPath) {
        const brand = await this.brandsRepository.findById(id);
        if (!brand) {
            throw new common_1.NotFoundException('Brand not found');
        }
        const { name, description, seoTitle, seoDescription, seoKeywords, status } = updateDto;
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
        if (logoPath)
            updateData.logo = logoPath;
        if (name && name !== brand.name) {
            const newSlug = generateSlug(name);
            const existing = await this.brandsRepository.findBySlug(newSlug);
            if (existing && existing._id.toString() !== id) {
                throw new common_1.BadRequestException(`Brand with name '${name}' or slug '${newSlug}' already exists`);
            }
            updateData.name = name;
            updateData.slug = newSlug;
        }
        const updatedBrand = await this.brandsRepository.update(id, { $set: updateData });
        if (!updatedBrand) {
            throw new common_1.NotFoundException('Brand not found');
        }
        return updatedBrand;
    }
    async delete(id) {
        const brand = await this.brandsRepository.findById(id);
        if (!brand) {
            throw new common_1.NotFoundException('Brand not found');
        }
        await this.brandsRepository.softDelete(id);
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [brands_repository_js_1.BrandsRepository])
], BrandsService);
//# sourceMappingURL=brands.service.js.map