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
exports.PagesRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const page_schema_js_1 = require("../schemas/page.schema.js");
let PagesRepository = class PagesRepository {
    pageModel;
    constructor(pageModel) {
        this.pageModel = pageModel;
    }
    async create(data) {
        const page = new this.pageModel(data);
        return page.save();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.pageModel.findOne({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }).exec();
    }
    async findBySlug(slug) {
        return this.pageModel.findOne({ slug, isDeleted: false }).exec();
    }
    async findAllPublished() {
        return this.pageModel
            .find({ isPublished: true, isDeleted: false })
            .select('-content')
            .sort({ title: 1 })
            .exec();
    }
    async findAllAdmin() {
        return this.pageModel.find({ isDeleted: false }).sort({ updatedAt: -1 }).exec();
    }
    async update(id, updateData) {
        return this.pageModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
            .exec();
    }
    async softDelete(id) {
        return this.pageModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
            .exec();
    }
};
exports.PagesRepository = PagesRepository;
exports.PagesRepository = PagesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(page_schema_js_1.Page.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PagesRepository);
//# sourceMappingURL=pages.repository.js.map