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
exports.SubscribersRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subscriber_schema_js_1 = require("../schemas/subscriber.schema.js");
let SubscribersRepository = class SubscribersRepository {
    subscriberModel;
    constructor(subscriberModel) {
        this.subscriberModel = subscriberModel;
    }
    async createOrUpdate(data) {
        const filterConditions = [];
        if (data.email)
            filterConditions.push({ email: data.email.toLowerCase().trim() });
        if (data.phone)
            filterConditions.push({ phone: data.phone.trim() });
        if (filterConditions.length > 0) {
            const existing = await this.subscriberModel.findOne({ $or: filterConditions }).exec();
            if (existing) {
                if (data.email)
                    existing.email = data.email.toLowerCase().trim();
                if (data.phone)
                    existing.phone = data.phone.trim();
                if (data.source)
                    existing.source = data.source;
                existing.isActive = true;
                return existing.save();
            }
        }
        const subscriber = new this.subscriberModel({
            email: data.email ? data.email.toLowerCase().trim() : undefined,
            phone: data.phone ? data.phone.trim() : undefined,
            source: data.source || 'FOOTER',
            isActive: true,
            subscribedAt: new Date(),
        });
        return subscriber.save();
    }
    async findAll(query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const filter = {};
        if (query.search && query.search.trim()) {
            const regex = new RegExp(query.search.trim(), 'i');
            filter.$or = [{ email: regex }, { phone: regex }, { source: regex }];
        }
        const skip = (page - 1) * limit;
        const [subscribers, total] = await Promise.all([
            this.subscriberModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.subscriberModel.countDocuments(filter).exec(),
        ]);
        return { subscribers, total, page, limit };
    }
    async deleteById(id) {
        return this.subscriberModel.findByIdAndDelete(id).exec();
    }
};
exports.SubscribersRepository = SubscribersRepository;
exports.SubscribersRepository = SubscribersRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscriber_schema_js_1.Subscriber.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SubscribersRepository);
//# sourceMappingURL=subscribers.repository.js.map