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
exports.CategoriesRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const category_schema_js_1 = require("../schemas/category.schema.js");
let CategoriesRepository = class CategoriesRepository {
    categoryModel;
    constructor(categoryModel) {
        this.categoryModel = categoryModel;
    }
    async create(categoryData) {
        const category = new this.categoryModel(categoryData);
        return category.save();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.categoryModel.findOne({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }).exec();
    }
    async findBySlug(slug) {
        return this.categoryModel.findOne({ slug, isDeleted: false }).exec();
    }
    async findByIdOrSlug(idOrSlug) {
        if (mongoose_2.Types.ObjectId.isValid(idOrSlug)) {
            const byId = await this.categoryModel.findOne({ _id: new mongoose_2.Types.ObjectId(idOrSlug), isDeleted: false }).exec();
            if (byId)
                return byId;
        }
        return this.categoryModel.findOne({ slug: idOrSlug, isDeleted: false }).exec();
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, sort, sortBy, sortOrder, parentId, status } = queryDto;
        const filter = { isDeleted: false };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (parentId !== undefined && parentId !== '') {
            if (parentId === 'null') {
                filter.parentId = null;
            }
            else if (mongoose_2.Types.ObjectId.isValid(parentId)) {
                filter.parentId = new mongoose_2.Types.ObjectId(parentId);
            }
        }
        if (status !== undefined) {
            filter.status = status;
        }
        const sortOption = {};
        if (sort) {
            const isDesc = sort.startsWith('-');
            const field = isDesc ? sort.substring(1) : sort;
            sortOption[field] = isDesc ? -1 : 1;
        }
        else if (sortBy) {
            sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;
        }
        else {
            sortOption.createdAt = -1;
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.categoryModel.find(filter).sort(sortOption).skip(skip).limit(limit).exec(),
            this.categoryModel.countDocuments(filter).exec(),
        ]);
        return { data, total };
    }
    async update(id, updateData) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.categoryModel
            .findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }, updateData, { new: true })
            .exec();
    }
    async softDelete(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.categoryModel
            .findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }, { $set: { isDeleted: true, status: false, deletedAt: new Date() } }, { new: true })
            .exec();
    }
    async findDirectChildren(parentId) {
        if (!mongoose_2.Types.ObjectId.isValid(parentId))
            return [];
        return this.categoryModel
            .find({ parentId: new mongoose_2.Types.ObjectId(parentId), isDeleted: false })
            .exec();
    }
    async findDescendants(categoryId) {
        if (!mongoose_2.Types.ObjectId.isValid(categoryId))
            return [];
        return this.categoryModel
            .find({ 'ancestors._id': new mongoose_2.Types.ObjectId(categoryId), isDeleted: false })
            .exec();
    }
    async softDeleteDescendants(categoryId) {
        if (!mongoose_2.Types.ObjectId.isValid(categoryId))
            return;
        await this.categoryModel
            .updateMany({
            $or: [
                { parentId: new mongoose_2.Types.ObjectId(categoryId) },
                { 'ancestors._id': new mongoose_2.Types.ObjectId(categoryId) },
            ],
            isDeleted: false,
        }, { $set: { isDeleted: true, status: false, deletedAt: new Date() } })
            .exec();
    }
    async findRootCategories() {
        return this.categoryModel.find({ parentId: null, isDeleted: false }).sort({ displayOrder: 1, createdAt: -1 }).exec();
    }
    async findAllSubCategories() {
        return this.categoryModel.find({ parentId: { $ne: null }, isDeleted: false }).sort({ displayOrder: 1, createdAt: -1 }).exec();
    }
};
exports.CategoriesRepository = CategoriesRepository;
exports.CategoriesRepository = CategoriesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(category_schema_js_1.Category.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CategoriesRepository);
//# sourceMappingURL=categories.repository.js.map