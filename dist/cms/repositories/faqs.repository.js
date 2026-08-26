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
exports.FaqsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const faq_schema_js_1 = require("../schemas/faq.schema.js");
let FaqsRepository = class FaqsRepository {
    faqModel;
    constructor(faqModel) {
        this.faqModel = faqModel;
    }
    async create(data) {
        const faq = new this.faqModel(data);
        return faq.save();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.faqModel.findOne({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }).exec();
    }
    async findAllActiveGrouped() {
        const faqs = await this.faqModel
            .find({ isActive: true, isDeleted: false })
            .sort({ category: 1, displayOrder: 1 })
            .exec();
        const grouped = {};
        for (const faq of faqs) {
            if (!grouped[faq.category]) {
                grouped[faq.category] = [];
            }
            grouped[faq.category].push(faq);
        }
        return grouped;
    }
    async findAllAdmin() {
        return this.faqModel
            .find({ isDeleted: false })
            .sort({ category: 1, displayOrder: 1 })
            .exec();
    }
    async update(id, updateData) {
        return this.faqModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
            .exec();
    }
    async softDelete(id) {
        return this.faqModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
            .exec();
    }
};
exports.FaqsRepository = FaqsRepository;
exports.FaqsRepository = FaqsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(faq_schema_js_1.Faq.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FaqsRepository);
//# sourceMappingURL=faqs.repository.js.map