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
exports.BannersRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const banner_schema_js_1 = require("../schemas/banner.schema.js");
let BannersRepository = class BannersRepository {
    bannerModel;
    constructor(bannerModel) {
        this.bannerModel = bannerModel;
    }
    async create(data) {
        const banner = new this.bannerModel(data);
        return banner.save();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.bannerModel.findOne({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }).exec();
    }
    async findActive(query) {
        const now = new Date();
        const filter = {
            isActive: true,
            isDeleted: false,
            $or: [
                { startDate: null, endDate: null },
                { startDate: { $lte: now }, endDate: { $gte: now } },
                { startDate: { $lte: now }, endDate: null },
                { startDate: null, endDate: { $gte: now } },
            ],
        };
        if (query.type)
            filter.type = query.type;
        if (query.position)
            filter.position = query.position;
        return this.bannerModel
            .find(filter)
            .sort({ displayOrder: 1, createdAt: -1 })
            .exec();
    }
    async findAll(query) {
        const filter = { isDeleted: false };
        if (query.type)
            filter.type = query.type;
        if (query.position)
            filter.position = query.position;
        if (query.isActive !== undefined)
            filter.isActive = query.isActive;
        return this.bannerModel
            .find(filter)
            .sort({ type: 1, displayOrder: 1, createdAt: -1 })
            .exec();
    }
    async update(id, updateData) {
        return this.bannerModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true })
            .exec();
    }
    async softDelete(id) {
        return this.bannerModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
            .exec();
    }
};
exports.BannersRepository = BannersRepository;
exports.BannersRepository = BannersRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(banner_schema_js_1.Banner.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], BannersRepository);
//# sourceMappingURL=banners.repository.js.map