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
exports.AnnouncementsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const announcement_schema_js_1 = require("../schemas/announcement.schema.js");
let AnnouncementsRepository = class AnnouncementsRepository {
    announcementModel;
    constructor(announcementModel) {
        this.announcementModel = announcementModel;
    }
    async create(createDto) {
        const created = new this.announcementModel(createDto);
        return created.save();
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, isActive } = queryDto;
        const filter = { isDeleted: false };
        if (isActive !== undefined && isActive !== null && isActive !== '') {
            filter.isActive = String(isActive) === 'true';
        }
        if (search) {
            filter.$or = [
                { text: { $regex: search, $options: 'i' } },
                { badge: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const baseFilter = { isDeleted: false };
        const [data, total, totalAll, activeCount] = await Promise.all([
            this.announcementModel
                .find(filter)
                .sort({ priority: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.announcementModel.countDocuments(filter).exec(),
            this.announcementModel.countDocuments(baseFilter).exec(),
            this.announcementModel.countDocuments({ ...baseFilter, isActive: true }).exec(),
        ]);
        return {
            data,
            total,
            page,
            limit,
            stats: {
                total: totalAll,
                active: activeCount,
            },
        };
    }
    async findActiveAnnouncements() {
        return this.announcementModel
            .find({ isDeleted: false, isActive: true })
            .sort({ priority: -1, createdAt: -1 })
            .exec();
    }
    async findById(id) {
        return this.announcementModel.findOne({ _id: id, isDeleted: false }).exec();
    }
    async update(id, updateDto) {
        return this.announcementModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, { $set: updateDto }, { new: true })
            .exec();
    }
    async softDelete(id) {
        return this.announcementModel
            .findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true, isActive: false } }, { new: true })
            .exec();
    }
};
exports.AnnouncementsRepository = AnnouncementsRepository;
exports.AnnouncementsRepository = AnnouncementsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(announcement_schema_js_1.Announcement.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AnnouncementsRepository);
//# sourceMappingURL=announcements.repository.js.map