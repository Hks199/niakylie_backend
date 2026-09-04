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
exports.NotificationsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_js_1 = require("../schemas/notification.schema.js");
let NotificationsRepository = class NotificationsRepository {
    notificationModel;
    constructor(notificationModel) {
        this.notificationModel = notificationModel;
    }
    async create(data) {
        const notification = new this.notificationModel(data);
        return notification.save();
    }
    async createMany(dataList) {
        const docs = await this.notificationModel.insertMany(dataList);
        return docs;
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            return null;
        return this.notificationModel.findOne({ _id: new mongoose_2.Types.ObjectId(id), isDeleted: false }).exec();
    }
    async findByUserId(userId, query) {
        const { page = 1, limit = 10, isRead, type } = query;
        const userObjId = new mongoose_2.Types.ObjectId(userId);
        const userTotalCount = await this.notificationModel.countDocuments({ userId: userObjId, isDeleted: false }).exec();
        if (userTotalCount === 0) {
            await this.notificationModel.insertMany([
                {
                    userId: userObjId,
                    type: 'offer',
                    channel: 'in_app',
                    title: 'Welcome to NiaKylie!',
                    message: 'Enjoy 15% OFF on your first purchase with coupon code FESTIVE15.',
                    isRead: false,
                    status: 'SENT',
                    createdAt: new Date(),
                },
                {
                    userId: userObjId,
                    type: 'system',
                    channel: 'in_app',
                    title: 'Complimentary Nationwide Shipping',
                    message: 'Get free express shipping on all orders over ₹1,000 across India.',
                    isRead: false,
                    status: 'SENT',
                    createdAt: new Date(Date.now() - 3600000),
                },
                {
                    userId: userObjId,
                    type: 'coupon',
                    channel: 'in_app',
                    title: 'Exclusive Festive Coupon Drop',
                    message: 'Special ₹500 flat discount unlocked! Use code NIAKYLIE500 on sarees and ethnic wear.',
                    isRead: false,
                    status: 'SENT',
                    createdAt: new Date(Date.now() - 7200000),
                },
            ]);
        }
        const filter = {
            userId: userObjId,
            isDeleted: false,
        };
        if (isRead !== undefined) {
            const boolVal = Boolean(isRead) || String(isRead) === 'true';
            filter.isRead = boolVal ? { $in: [true, 'true'] } : { $ne: true };
        }
        if (type && type.trim()) {
            const typeStr = type.trim().toUpperCase();
            if (typeStr === 'OFFER' || typeStr === 'DEALS' || typeStr === 'COUPON' || typeStr === 'PRICE_DROP') {
                filter.type = { $in: ['OFFER', 'offer', 'COUPON', 'coupon', 'PRICE_DROP', 'price_drop', 'PROMOTIONAL', 'promotional'] };
            }
            else if (typeStr === 'ORDER_UPDATE' || typeStr === 'ORDERS' || typeStr === 'ORDER') {
                filter.type = { $in: ['ORDER_UPDATE', 'order_update'] };
            }
            else {
                filter.type = new RegExp(`^${typeStr}$`, 'i');
            }
        }
        const skip = (page - 1) * limit;
        const [data, total, unreadCount] = await Promise.all([
            this.notificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.notificationModel.countDocuments(filter).exec(),
            this.countUnread(userId),
        ]);
        return { data, total, unreadCount, page, limit };
    }
    async countUnread(userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId))
            return 0;
        return this.notificationModel
            .countDocuments({
            userId: new mongoose_2.Types.ObjectId(userId),
            isRead: { $ne: true },
            isDeleted: false,
        })
            .exec();
    }
    async markAsRead(id, userId) {
        if (!mongoose_2.Types.ObjectId.isValid(id) || !mongoose_2.Types.ObjectId.isValid(userId))
            return null;
        return this.notificationModel
            .findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(id), userId: new mongoose_2.Types.ObjectId(userId), isDeleted: false }, { isRead: true, readAt: new Date() }, { new: true })
            .exec();
    }
    async markAllAsRead(userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId))
            return { modifiedCount: 0 };
        const res = await this.notificationModel
            .updateMany({ userId: new mongoose_2.Types.ObjectId(userId), isRead: false, isDeleted: false }, { isRead: true, readAt: new Date() })
            .exec();
        return { modifiedCount: res.modifiedCount };
    }
    async softDelete(id, userId) {
        if (!mongoose_2.Types.ObjectId.isValid(id) || !mongoose_2.Types.ObjectId.isValid(userId))
            return null;
        return this.notificationModel
            .findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(id), userId: new mongoose_2.Types.ObjectId(userId), isDeleted: false }, { isDeleted: true }, { new: true })
            .exec();
    }
};
exports.NotificationsRepository = NotificationsRepository;
exports.NotificationsRepository = NotificationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_js_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NotificationsRepository);
//# sourceMappingURL=notifications.repository.js.map