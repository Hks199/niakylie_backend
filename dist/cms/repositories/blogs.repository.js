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
exports.BlogsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const blog_schema_js_1 = require("../schemas/blog.schema.js");
let BlogsRepository = class BlogsRepository {
    blogModel;
    constructor(blogModel) {
        this.blogModel = blogModel;
    }
    async create(data) {
        const blog = new this.blogModel(data);
        return blog.save();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.blogModel.findOne({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }).exec();
    }
    async findBySlug(slug) {
        return this.blogModel.findOne({ slug, isDeleted: false }).exec();
    }
    async findPublished(query) {
        const { page = 1, limit = 10, category, search, tag } = query;
        const filter = {
            isPublished: true,
            isDeleted: false,
        };
        if (category) {
            filter.category = category;
        }
        if (tag) {
            filter.tags = tag;
        }
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [{ title: regex }, { summary: regex }, { tags: regex }];
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.blogModel.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).exec(),
            this.blogModel.countDocuments(filter).exec(),
        ]);
        return { data, total, page, limit };
    }
    async incrementViewCount(id) {
        await this.blogModel.updateOne({ _id: id }, { $inc: { viewCount: 1 } }).exec();
    }
    async update(id, updateData) {
        return this.blogModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
            .exec();
    }
    async softDelete(id) {
        return this.blogModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
            .exec();
    }
};
exports.BlogsRepository = BlogsRepository;
exports.BlogsRepository = BlogsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(blog_schema_js_1.Blog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BlogsRepository);
//# sourceMappingURL=blogs.repository.js.map